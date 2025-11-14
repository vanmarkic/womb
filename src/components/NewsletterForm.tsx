import { useState } from 'preact/hooks';

interface NewsletterFormProps {
  lang: 'en' | 'fr';
}

export default function NewsletterForm({ lang }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const translations = {
    en: {
      placeholder: 'Enter your email',
      button: 'Subscribe',
      buttonLoading: 'Subscribing...',
      success: 'Thank you for subscribing!',
      error: 'Something went wrong. Please try again.',
      invalidEmail: 'Please enter a valid email address.',
    },
    fr: {
      placeholder: 'Entrez votre email',
      button: 'S\'abonner',
      buttonLoading: 'Abonnement...',
      success: 'Merci de vous être abonné !',
      error: 'Une erreur s\'est produite. Veuillez réessayer.',
      invalidEmail: 'Veuillez entrer une adresse email valide.',
    },
  };

  const t = translations[lang];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage(t.invalidEmail);
      setStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage(t.invalidEmail);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // TODO: Replace with actual newsletter service integration
      // For now, this is a placeholder that simulates an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, you would make an actual API call here:
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // if (!response.ok) throw new Error('Subscription failed');

      setStatus('success');
      setMessage(t.success);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(t.error);
    }
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
          disabled={status === 'loading'}
          required
        />
        <button
          type="submit"
          class="newsletter-button"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? t.buttonLoading : t.button}
        </button>
      </div>
      {message && (
        <p class={`newsletter-message ${status === 'success' ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </form>
  );
}

