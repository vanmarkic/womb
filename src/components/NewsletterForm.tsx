import { useState } from 'preact/hooks';

interface NewsletterFormProps {
  lang: 'en' | 'fr';
}

export default function NewsletterForm({ lang }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const translations = {
    en: {
      placeholder: 'Enter your email',
      button: 'Subscribe',
      success: 'Opening your email client...',
      invalidEmail: 'Please enter a valid email address.',
      subject: 'Newsletter Subscription',
      body: 'Please subscribe me to the WOMB newsletter.',
    },
    fr: {
      placeholder: 'Entrez votre email',
      button: 'S\'abonner',
      success: 'Ouverture de votre client email...',
      invalidEmail: 'Veuillez entrer une adresse email valide.',
      subject: 'Abonnement Newsletter',
      body: 'Veuillez m\'abonner à la newsletter WOMB.',
    },
  };

  const t = translations[lang];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage(t.invalidEmail);
      return;
    }

    if (!validateEmail(email)) {
      setMessage(t.invalidEmail);
      return;
    }

    // Create mailto link with email in body
    const subject = encodeURIComponent(t.subject);
    const body = encodeURIComponent(`${t.body}\n\nEmail: ${email}`);
    const mailtoLink = `mailto:newsletter@womb-ambient.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    setMessage(t.success);
    setEmail('');
    
    // Reset message after 3 seconds
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  return (
    <form class="newsletter-form" onSubmit={handleSubmit}>
      <div class="newsletter-input-group">
        <input
          type="email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          placeholder={t.placeholder}
          class="newsletter-input"
          required
        />
        <button
          type="submit"
          class="newsletter-button"
        >
          {t.button}
        </button>
      </div>
      {message && (
        <p class={`newsletter-message ${message === t.success ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </form>
  );
}

