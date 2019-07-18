import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('O e-mail foi enviado!');

    await Mail.sendEmail({
      to: `${user.name} <${user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        manager: user.name,
        user: user.name,
        event: meetup.title,
        date: format(
          parseISO(meetup.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
