import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('O e-mail foi enviado!');

    await Mail.sendEmail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        manager: meetup.user.name,
        event: meetup.title,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
