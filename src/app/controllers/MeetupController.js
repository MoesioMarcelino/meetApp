import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import MeetUp from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Some value is not valid!' });
    }

    const { title, description, location, date, banner_id } = req.body;

    /**
     * Check if banner_id exists
     */
    const checkBanner = await File.findOne({ where: { id: banner_id } });

    if (!checkBanner) {
      return res.status(401).json({ error: 'Banner_id is not valid!' });
    }

    /**
     * Check title avalable
     */
    const checkTitle = await MeetUp.findOne({ where: { title } });

    if (checkTitle) {
      return res.status(401).json({ error: 'Title is not available!' });
    }

    /**
     * Check date parsed
     */

    const checkData = parseISO(date);

    if (isBefore(checkData, new Date())) {
      return res.status(400).json({ error: 'This date is not valid!' });
    }

    const meetup = await MeetUp.create({
      title,
      description,
      location,
      date,
      user_id: req.userId,
      banner_id,
    });

    return res.json(meetup);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const searchDate = parseISO(req.query.date);

    const meetups = await MeetUp.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    if (meetups.length === 0) {
      return res.status(400).json({
        error: `There are no meetups for this user, in the page ${page}`,
      });
    }

    return res.json(meetups);
  }

  async show(req, res) {
    const { page = 1 } = req.query;

    const meetups = await MeetUp.findAll({
      where: { user_id: req.userId },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'url', 'path'],
        },
      ],
    });

    if (meetups.length === 0) {
      return res.status(400).json({
        error: `There are no meetups for this user, in the page ${page}`,
      });
    }

    return res.json(meetups);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Some value is not valid!' });
    }

    const { date, banner_id } = req.body;

    /**
     * Check if banner_id exists
     */
    const checkBanner = await File.findOne({ where: { id: banner_id } });

    if (!checkBanner) {
      return res.status(401).json({ error: 'Banner_id is not valid!' });
    }

    /**
     * Check date parsed
     */
    const checkData = parseISO(date);

    if (isBefore(checkData, new Date())) {
      return res.status(400).json({ error: 'This date is not valid!' });
    }

    /**
     * Check if meetup exists
     */
    const meetup = await MeetUp.findOne({
      where: { id: req.params.idMeetup },
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'user_id',
        'banner_id',
      ],
    });

    if (meetup.user_id !== req.userId) {
      return res.status(400).json({ error: 'Not authorized!' });
    }

    if (!meetup) {
      return res.status(400).json({ error: 'The meetup not exists!' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await MeetUp.findOne({
      where: { id: req.params.idMeetup, user_id: req.userId },
    });

    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found!' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({ error: 'This meetup already happened' });
    }

    await meetup.destroy();

    return res.json();
  }
}

export default new MeetupController();
