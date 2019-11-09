import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class HelpOrderMail {
  get key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const helpOrder = data.answeredHelpOrder;
    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Sua pergunta foi respondida',
      template: 'help_order',
      context: {
        student: helpOrder.student.name,
        question: helpOrder.question,
        answer: helpOrder.answer,
        question_date: format(
          parseISO(helpOrder.createdAt),
          "dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        answer_at: format(
          parseISO(helpOrder.answer_at),
          "dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new HelpOrderMail();
