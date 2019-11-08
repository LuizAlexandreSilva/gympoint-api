import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, start_date, end_date, price } = data;
    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Nova matrícula',
      template: 'registration',
      context: {
        student: student.name,
        plan: plan.title,
        price,
        start_date: format(parseISO(start_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        end_date: format(
          parseISO(end_date),
          `dd/MM/yyyy '(${plan.duration} meses depois do início)'`,
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new RegistrationMail();
