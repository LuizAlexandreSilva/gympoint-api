import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Registration from '../models/Registration';

class StudentHelpOrderController {
  async index(req, res) {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: id },
      include: [
        { model: Student, as: 'student', attributes: ['name', 'email'] },
      ],
    });
    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string()
        .min(10)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const student = await Student.findByPk(id);
    const { question } = req.body;

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Check if student has a registration
    const registration = await Registration.findOne({
      where: { student_id: id },
    });

    if (!registration) {
      return res
        .status(400)
        .json({ error: 'You are not allowed to make a question' });
    }

    const helpOrder = await HelpOrder.create({
      student_id: id,
      question,
    });

    return res.json(helpOrder);
  }
}

export default new StudentHelpOrderController();
