import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import HelpOrderMail from '../jobs/HelpOrderMail';

class HelpOrderController {
  async index(req, res) {
    const waitingHelpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
      include: [{ model: Student, as: 'student' }],
    });

    return res.json(waitingHelpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string()
        .min(10)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { answer } = req.body;
    const helpOrder = await HelpOrder.findByPk(id, {
      include: [{ model: Student, as: 'student' }],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order not found' });
    }

    const answeredHelpOrder = await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    await Queue.add(HelpOrderMail.key, {
      answeredHelpOrder,
    });

    return res.json(answeredHelpOrder);
  }
}

export default new HelpOrderController();
