import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    console.log('O e-mail foi enviado!');

    await Mail.sendEmail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: 'Nova inscrição',
      template: 'subscription',
      context: {
        manager: meetup.User.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
