import { isBefore } from 'date-fns';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async store(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.body.meetup_id } });

    if (!meetup) {
      return res.status(400).json({ error: "meetup_id don't exists" });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: "You can't subscribe in yourself event" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'Event already happened!' });
    }

    const checkUserSubscribed = await Meetup.findOne({
      where: { id: req.body.meetup_id, user_id: req.userId },
    });

    if (checkUserSubscribed) {
      return res.status(401).json({
        error: "You can't subscribe in the same event 2 or more times!",
      });
    }

    const checkIfDatesEvents = await Meetup.findOne({
      where: { user_id: req.userId, date: meetup.date },
    });

    if (checkIfDatesEvents) {
      return res
        .status(401)
        .json({ error: "You can't subscribe in 2 events in the same hour!" });
    }

    const { meetup_id } = req.body;

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    return res.json(subscription);
  }
}

export default new SubscriptionController();
