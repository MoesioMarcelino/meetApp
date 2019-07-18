import { isBefore } from 'date-fns';
import * as Yup from 'yup';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionsMail';

class SubscriptionController {
  async store(req, res) {
    const { meetupId } = req.params;

    const meetup = await Meetup.findByPk(meetupId, {
      include: [{ model: User, as: 'user' }],
    });

    if (!meetup) {
      return res.status(400).json({ error: 'meetup_id not exists' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: "You can't subscribe in yourself event" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'Event already happened!' });
    }

    const checkUserSubscribed = await Subscription.findOne({
      where: { meetup_id: meetup.id, user_id: req.userId },
    });

    if (checkUserSubscribed) {
      return res.status(401).json({
        error: "You can't subscribe in the same event 2 or more times!",
      });
    }

    const checkDate = await Subscription.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: { date: meetup.date },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Can't subscribe to two meetups at the same time" });
    }

    const subscription = await Subscription.create({
      meetup_id: meetupId,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    await Queue.add(SubscriptionMail.key, {
      user,
      meetup,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
