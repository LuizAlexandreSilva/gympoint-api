import { Op } from 'sequelize';
import { isAfter } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Registration from '../models/Registration';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    const checkins = await Checkin.findAll({ where: { student_id: id } });

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    if (!checkins.length) {
      return res.status(400).json({ error: 'Student has no checkins' });
    }

    return res.json(checkins);
  }

  async store(req, res) {
    const now = new Date();
    const start_date = now.getDate() - 7;
    const { id } = req.params;
    const student = await Student.findByPk(id);
    const registration = await Registration.findOne({
      where: { student_id: id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    if (!registration || isAfter(now, registration.end_date)) {
      return res
        .status(400)
        .json({ error: 'Student is not allowed to checkin' });
    }

    const countCheckins = await Checkin.findAndCountAll({
      where: {
        student_id: id,
        created_at: { [Op.between]: [start_date, now] },
      },
    });

    let checkin;
    if (countCheckins && countCheckins.count < 5) {
      checkin = await Checkin.create({ student_id: id });
    } else {
      return res
        .status(400)
        .json({ error: 'You have reached max number of checkins in 7 days' });
    }

    return res.json(checkin);
  }
}

export default new CheckinController();
