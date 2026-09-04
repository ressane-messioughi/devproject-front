import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFetch } from '../../hooks/useFetch.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';
import logo from '../../assets/image/logo.webp';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import AlertBanner from '../ui/AlertBanner.jsx';
import FormField from '../ui/FormField.jsx';
import Button from '../ui/Button.jsx';
import { INPUT_PLACEHOLDER_CLASS } from '../../constants/formClasses.js';

const PHONE_REGEX = /^0[1-9](\.\d{2}){4}$/;
const UPPERCASE_REGEX = /[A-Z]/;
const DIGIT_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const { apiFetch } = useFetch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  // Fonction pour gérer la soumission du formulaire d'inscription
  const handleSubmitForm = async (data) => {
    setApiError('');

    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      setApiError(getErrorMessage(result, 'Inscription impossible.'));
      return;
    }
    toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    navigate('/login');
  };

  return (
    <div className="bg-(--color-card) flex flex-col items-center justify-center gap-4 border border-(--color-card-border) rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition duration-300 hover:bg-(--color-card-hover) hover:-translate-y-1 w-full max-w-sm">
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className="flex flex-col w-full items-center gap-5"
      >
        <img src={logo} alt="Logo" className="w-40 mx-auto" />

        <AlertBanner message={apiError} className="w-full max-w-xs" />

        <FormField
          id="username"
          label="Pseudo :"
          register={register('username', { required: 'Pseudo requis' })}
          error={errors.username}
        />

        <FormField
          id="firstname"
          label="Prénom :"
          register={register('firstname', { required: 'Prénom requis' })}
          error={errors.firstname}
        />

        <FormField
          id="lastname"
          label="Nom :"
          register={register('lastname', { required: 'Nom requis' })}
          error={errors.lastname}
        />

        <FormField
          id="email"
          label="Email :"
          type="email"
          register={register('email', { required: 'Email requis' })}
          error={errors.email}
        />

        <FormField
          id="password"
          label="Mot de passe :"
          type="password"
          register={register('password', {
            required: 'Mot de passe requis',
            minLength: {
              value: 8,
              message: 'Le mot de passe doit contenir au moins 8 caractères',
            },
            validate: {
              majuscule: (value) =>
                UPPERCASE_REGEX.test(value) ||
                'Le mot de passe doit contenir au moins une majuscule',
              chiffre: (value) =>
                DIGIT_REGEX.test(value) || 'Le mot de passe doit contenir au moins un chiffre',
              special: (value) =>
                SPECIAL_CHAR_REGEX.test(value) ||
                'Le mot de passe doit contenir au moins un caractère spécial',
            },
          })}
          error={errors.password}
        />

        <FormField
          id="city"
          label="Ville :"
          register={register('city', { required: 'Ville requise' })}
          error={errors.city}
        />

        <FormField
          id="phone"
          label="Téléphone :"
          type="tel"
          placeholder="07.69.46.12.34"
          className={INPUT_PLACEHOLDER_CLASS}
          register={register('phone', {
            required: 'Numéro de téléphone requis',
            pattern: {
              value: PHONE_REGEX,
              message: 'Format attendu : 07.69.46.12.34',
            },
          })}
          error={errors.phone}
        />

        <div className="flex justify-center">
          <Button type="submit">Inscription</Button>
        </div>
      </form>
      <Link to="/login" className="text-text-secondary underline">
        Déjà inscrit ?
      </Link>
    </div>
  );
}

export default RegisterForm;
