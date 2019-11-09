import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { student_id } = req.query;
    const registrations = student_id
      ? await Registration.findOne({ where: { student_id } })
      : await Registration.findAll({
          include: [
            {
              model: Student,
              attributes: ['name', 'email'],
            },
          ],
        });

    if (!registrations) {
      return res.status(400).json({ error: 'Registration(s) not found' });
    }
    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const { duration } = plan;
    const end_date = addMonths(parseISO(start_date), duration);
    const price = plan.price * duration;

    const registration = await Registration.create(
      {
        student_id,
        plan_id,
        start_date,
        end_date,
        price,
      },
      {
        include: [Student],
      }
    );

    if (!registration) {
      return res
        .status(400)
        .json({ error: 'An error occurred during registration' });
    }

    await Queue.add(RegistrationMail.key, {
      student,
      plan,
      start_date,
      end_date,
      price,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    const { plan_id, start_date } = req.body;
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    const { duration } = plan;
    const end_date = addMonths(parseISO(start_date), duration);
    const price = plan.price * duration;

    const updatedRegistration = await registration.update({
      plan_id,
      start_date,
      end_date,
      price,
    });

    return res.json(updatedRegistration);
  }

  async delete(req, res) {
    const { id } = req.params;

    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(400).json({ error: 'Registration not found' });
    }

    const deletedRegistration = await registration.destroy();
    if (deletedRegistration === 0) {
      return res.status(400).json({ error: 'Error during delete operation' });
    }

    return res.json({ success: 'Registration successfully deleted' });
  }
}

export default new RegistrationController();
