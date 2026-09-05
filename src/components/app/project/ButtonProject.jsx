import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFetch } from '../../../hooks/useFetch.js';
import Modal from '../../ui/Modal.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AlertBanner from '../../ui/AlertBanner.jsx';
import FieldError from '../../ui/FieldError.jsx';
import ModalField from '../../ui/ModalField.jsx';
import Button from '../../ui/Button.jsx';
import { MODAL_LABEL_CLASS, TEAM_CODE_INPUT_CLASS } from '../../../constants/formClasses.js';
import useProject from '../../../hooks/useProject.js';
import { getErrorMessage } from '../../../utils/getErrorMessage.js';

function ButtonProject() {
  const [openModal, setOpenModal] = useState(null);
  const [joinApiError, setJoinApiError] = useState('');
  const [createApiError, setCreateApiError] = useState('');
  const { apiFetch } = useFetch();
  const navigate = useNavigate();
  const {
    register: registerJoin,
    handleSubmit: handleSubmitJoinForm,
    formState: { errors: joinErrors },
  } = useForm({
    mode: 'onTouched',
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreateForm,
    formState: { errors: createErrors },
  } = useForm({
    mode: 'onTouched',
  });

  const { setProjects, setSelectedProject } = useProject();

  // Fonction pour rejoindre un projet
  // =============================================
  const handleSubmitJoin = async (data) => {
    setJoinApiError('');
    const response = await apiFetch('/project/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      const message = getErrorMessage(result, 'Impossible de rejoindre ce projet.');
      setJoinApiError(message);
      toast.error(message);
      return;
    }
    toast.success(
      "Demande envoyée avec succès ! Veulliez attendre la confirmation du chef d'équipe",
    );
    navigate('/panel');
  };
  // Fonction pour créer un projet
  // =============================================
  const handleSubmitCreate = async (data) => {
    setCreateApiError('');
    const response = await apiFetch('/project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      const message = getErrorMessage(result, 'Impossible de créer le projet.');
      setCreateApiError(message);
      toast.error(message);
      return;
    }
    const newProject = {
      id_project: result.result.insertId,
      name: data.name,
      description: data.description,
      trello_url: data.trello_url,
      role: 'OWNER',
    };
    setProjects((prev) => [...prev, newProject]);
    setSelectedProject(newProject);
    localStorage.setItem('selectedProject', JSON.stringify(newProject));
    setOpenModal(null);
    toast.success('Projet créé avec succès !');
  };

  return (
    <>
      <section className="">
        <div className="w-full bg-(--color-surface) border border-white/10 rounded-xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Projet</h2>
            <p className="text-sm text-gray-400">Liste des projets en cours.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOpenModal('create')}>Rejoindre un projet</Button>
            <Modal
              isOpen={openModal === 'create'}
              onClose={() => setOpenModal(false)}
              title="Rejoindre un projet : "
            >
              <form
                onSubmit={handleSubmitJoinForm(handleSubmitJoin)}
                className="flex flex-col gap-3 bg-white/4 backdrop-blur-md border border-white/8 p-2 rounded-sm"
              >
                <AlertBanner message={joinApiError} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-around gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <ModalField
                        id="team_code"
                        label="Code du projet :"
                        labelClassName={`${MODAL_LABEL_CLASS} w-full`}
                        className={TEAM_CODE_INPUT_CLASS}
                        register={registerJoin('team_code', { required: 'Code du projet requis' })}
                      />
                    </div>
                    <FieldError error={joinErrors.team_code} />
                  </div>
                  <Button variant="secondary" type="submit">
                    Rejoindre
                  </Button>
                </div>
              </form>
            </Modal>

            <Button onClick={() => setOpenModal('join')}>Créer un projet</Button>
            <Modal
              isOpen={openModal === 'join'}
              onClose={() => setOpenModal(false)}
              title="Créer un projet :"
            >
              <form
                onSubmit={handleSubmitCreateForm(handleSubmitCreate)}
                className="flex flex-col gap-2"
              >
                <AlertBanner message={createApiError} />

                <ModalField
                  id="name"
                  label="Nom du projet :"
                  register={registerCreate('name', {
                    required: 'Nom du projet requis',
                    minLength: {
                      value: 6,
                      message: 'Le nom du projet doit contenir au moins 6 caractères',
                    },
                  })}
                  error={createErrors.name}
                />

                <ModalField
                  id="description"
                  label="Description du projet :"
                  textarea
                  rows="3"
                  register={registerCreate('description', {
                    required: 'Description du projet requise',
                  })}
                  error={createErrors.description}
                />

                <ModalField
                  id="trello_url"
                  label="URL Trello :"
                  type="url"
                  placeholder="https://trello.com/b/..."
                  register={registerCreate('trello_url', { required: 'URL Trello requise' })}
                  error={createErrors.trello_url}
                />

                <Button variant="secondary" type="submit">
                  Créer
                </Button>
              </form>
            </Modal>
          </div>
        </div>
      </section>
    </>
  );
}

export default ButtonProject;
