export type Language = 'en' | 'fr' | 'es';

export interface Translations {
  dateLocale: string;
  // Hero buttons
  rsvpBtn: string;
  ourStoryBtn: string;
  // Story section
  ourStoryLabel: string;
  howWeGotHere: string;
  // Details section
  theDetails: string;
  dateAndLocation: string;
  ceremony: string;
  reception: string;
  venue: string;
  virtualEvent: string;
  joinOnline: string;
  getDirections: string;
  // RSVP section
  kindlyRespond: string;
  rsvp: string;
  // Gallery section
  gallery: string;
  memoriesSoFar: string;
  ourMoments: string;
  // Registry section
  registry: string;
  viewRegistry: string;
  // Footer
  questions: string;
  theCouple: string;
  madeWithMygala: string;
  withLove: string;
  // Countdown
  countingDown: string;
  todayIsTheDay: string;
  untilWeSayIDo: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
  // RSVP form
  fullName: string;
  email: string;
  phoneOptional: string;
  willYouAttend: string;
  joyfullyAccepts: string;
  regretfullyDeclines: string;
  numberOfGuests: string;
  justMe: string;
  guests: string;
  noteForCouple: string;
  noteForCouplePlaceholder: string;
  receiveUpdatesLabel: string;
  unsubscribeHint: string;
  sendRsvp: string;
  sending: string;
  successAttending: string;
  successNotAttending: string;
  confirmationNoted: string; // contains {{name}}
  errorName: string;
  errorEmail: string;
  errorGeneral: string;
  // Guest photos
  guestPhotos: string;
  shareYourPhoto: string;
  loadMore: string;
  beFirstToShare: string;
  photoUploaded: string;
  photoUploadError: string;
  // Song requests
  songRequests: string;
  buildOurPlaylist: string;
  yourName: string;
  songTitle: string;
  artistLabel: string;
  addSong: string;
  songAdded: string;
  songAddError: string;
  noSongsYet: string;
  requestedBy: string;
}

const en: Translations = {
  dateLocale: 'en-US',
  rsvpBtn: 'RSVP',
  ourStoryBtn: 'Our story',
  ourStoryLabel: 'Our story',
  howWeGotHere: 'How we got here',
  theDetails: 'The details',
  dateAndLocation: 'Date & location',
  ceremony: 'Ceremony',
  reception: 'Reception',
  venue: 'Venue',
  virtualEvent: 'Virtual Event',
  joinOnline: 'Join Online →',
  getDirections: 'Get directions →',
  kindlyRespond: 'Kindly respond',
  rsvp: 'RSVP',
  gallery: 'Gallery',
  memoriesSoFar: 'Memories so far',
  ourMoments: 'Our moments',
  registry: 'Registry',
  viewRegistry: 'View Registry',
  questions: 'Questions?',
  theCouple: 'the couple',
  madeWithMygala: 'made with mygala',
  withLove: 'With love',
  countingDown: 'Counting down',
  todayIsTheDay: 'Today is the day!',
  untilWeSayIDo: 'Until we say I do',
  days: 'Days',
  hours: 'Hours',
  mins: 'Mins',
  secs: 'Secs',
  fullName: 'full name',
  email: 'email',
  phoneOptional: 'phone (optional)',
  willYouAttend: 'will you attend?',
  joyfullyAccepts: 'joyfully accepts',
  regretfullyDeclines: 'regretfully declines',
  numberOfGuests: 'number of guests',
  justMe: 'just me',
  guests: 'guests',
  noteForCouple: 'note for the couple (optional)',
  noteForCouplePlaceholder: 'So excited for you two…',
  receiveUpdatesLabel: "I'd like to receive event updates via email",
  unsubscribeHint: 'you can unsubscribe at any time.',
  sendRsvp: 'send rsvp',
  sending: 'sending…',
  successAttending: "we can't wait to celebrate with you",
  successNotAttending: "we'll miss you, but thank you for letting us know",
  confirmationNoted: 'a confirmation has been noted for {{name}}.',
  errorName: 'Please enter your name.',
  errorEmail: 'Please enter a valid email address.',
  errorGeneral: 'Something went wrong. Please try again.',
  guestPhotos: 'Guest Photos',
  shareYourPhoto: 'Upload Photos',
  loadMore: 'Load more',
  beFirstToShare: 'Be the first to share a photo!',
  photoUploaded: 'Photo shared — thank you!',
  photoUploadError: 'Upload failed. Please try again.',
  songRequests: 'Song Requests',
  buildOurPlaylist: 'Build our playlist',
  yourName: 'Your name',
  songTitle: 'Song title',
  artistLabel: 'Artist',
  addSong: 'Add',
  songAdded: 'Song added — thank you!',
  songAddError: 'Failed to add song. Please try again.',
  noSongsYet: 'No song requests yet. Be the first!',
  requestedBy: 'Requested by',
};

const fr: Translations = {
  dateLocale: 'fr-FR',
  rsvpBtn: 'Confirmer',
  ourStoryBtn: 'Notre histoire',
  ourStoryLabel: 'Notre histoire',
  howWeGotHere: 'Comment tout a commencé',
  theDetails: 'Les détails',
  dateAndLocation: 'Date & lieu',
  ceremony: 'Cérémonie',
  reception: 'Réception',
  venue: 'Lieu',
  virtualEvent: 'Événement virtuel',
  joinOnline: 'Rejoindre en ligne →',
  getDirections: "Obtenir l'itinéraire →",
  kindlyRespond: 'Votre réponse',
  rsvp: 'RSVP',
  gallery: 'Galerie',
  memoriesSoFar: 'Nos souvenirs',
  ourMoments: 'Nos moments',
  registry: 'Liste de mariage',
  viewRegistry: 'Voir la liste',
  questions: 'Des questions?',
  theCouple: 'les mariés',
  madeWithMygala: 'créé avec mygala',
  withLove: 'Avec amour',
  countingDown: 'Compte à rebours',
  todayIsTheDay: "C'est le grand jour!",
  untilWeSayIDo: 'Jusqu\'au grand oui',
  days: 'Jours',
  hours: 'Heures',
  mins: 'Mins',
  secs: 'Secs',
  fullName: 'nom complet',
  email: 'courriel',
  phoneOptional: 'téléphone (facultatif)',
  willYouAttend: 'serez-vous présent(e)?',
  joyfullyAccepts: 'avec joie',
  regretfullyDeclines: 'avec regret',
  numberOfGuests: "nombre d'invités",
  justMe: 'juste moi',
  guests: 'invités',
  noteForCouple: 'note pour les mariés (facultatif)',
  noteForCouplePlaceholder: 'Tellement heureux/heureuse pour vous deux…',
  receiveUpdatesLabel: 'Je souhaite recevoir des mises à jour par courriel',
  unsubscribeHint: 'vous pouvez vous désabonner à tout moment.',
  sendRsvp: 'envoyer le RSVP',
  sending: 'envoi en cours…',
  successAttending: 'nous avons hâte de célébrer avec vous',
  successNotAttending: "vous nous manquerez, mais merci de nous l’avoir fait savoir",
  confirmationNoted: 'une confirmation a été notée pour {{name}}.',
  errorName: 'Veuillez entrer votre nom.',
  errorEmail: 'Veuillez entrer une adresse courriel valide.',
  errorGeneral: 'Une erreur est survenue. Veuillez réessayer.',
  guestPhotos: 'Photos des invités',
  shareYourPhoto: 'Télécharger une photo',
  loadMore: 'Charger plus',
  beFirstToShare: 'Soyez le premier à partager une photo!',
  photoUploaded: 'Photo partagée — merci!',
  photoUploadError: 'Échec du téléchargement. Veuillez réessayer.',
  songRequests: 'Demandes de chansons',
  buildOurPlaylist: 'Construisez notre playlist',
  yourName: 'Votre nom',
  songTitle: 'Titre de la chanson',
  artistLabel: 'Artiste',
  addSong: 'Ajouter',
  songAdded: 'Chanson ajoutée — merci!',
  songAddError: 'Échec de l\'ajout. Veuillez réessayer.',
  noSongsYet: 'Aucune demande encore. Soyez le premier!',
  requestedBy: 'Demandé par',
};

const es: Translations = {
  dateLocale: 'es-ES',
  rsvpBtn: 'Confirmar',
  ourStoryBtn: 'Nuestra historia',
  ourStoryLabel: 'Nuestra historia',
  howWeGotHere: 'Cómo llegamos aquí',
  theDetails: 'Los detalles',
  dateAndLocation: 'Fecha y lugar',
  ceremony: 'Ceremonia',
  reception: 'Recepción',
  venue: 'Lugar',
  virtualEvent: 'Evento virtual',
  joinOnline: 'Unirse en línea →',
  getDirections: 'Cómo llegar →',
  kindlyRespond: 'Confirma tu asistencia',
  rsvp: 'RSVP',
  gallery: 'Galería',
  memoriesSoFar: 'Nuestros recuerdos',
  ourMoments: 'Nuestros momentos',
  registry: 'Lista de bodas',
  viewRegistry: 'Ver la lista',
  questions: '¿Preguntas?',
  theCouple: 'los novios',
  madeWithMygala: 'hecho con mygala',
  withLove: 'Con amor',
  countingDown: 'Cuenta regresiva',
  todayIsTheDay: '¡Hoy es el gran día!',
  untilWeSayIDo: 'Hasta el sí quiero',
  days: 'Días',
  hours: 'Horas',
  mins: 'Mins',
  secs: 'Segs',
  fullName: 'nombre completo',
  email: 'correo electrónico',
  phoneOptional: 'teléfono (opcional)',
  willYouAttend: '¿asistirás?',
  joyfullyAccepts: 'con mucho gusto',
  regretfullyDeclines: 'con pesar declina',
  numberOfGuests: 'número de invitados',
  justMe: 'solo yo',
  guests: 'invitados',
  noteForCouple: 'nota para los novios (opcional)',
  noteForCouplePlaceholder: 'Muy emocionado/a por ustedes dos…',
  receiveUpdatesLabel: 'Quisiera recibir actualizaciones del evento por correo',
  unsubscribeHint: 'puedes darte de baja en cualquier momento.',
  sendRsvp: 'enviar RSVP',
  sending: 'enviando…',
  successAttending: 'no podemos esperar para celebrar contigo',
  successNotAttending: 'te echaremos de menos, pero gracias por avisarnos',
  confirmationNoted: 'se ha registrado la confirmación para {{name}}.',
  errorName: 'Por favor ingresa tu nombre.',
  errorEmail: 'Por favor ingresa una dirección de correo válida.',
  errorGeneral: 'Algo salió mal. Por favor intenta de nuevo.',
  guestPhotos: 'Fotos de invitados',
  shareYourPhoto: 'Subir Fotos',
  loadMore: 'Cargar más',
  beFirstToShare: '¡Sé el primero en compartir una foto!',
  photoUploaded: 'Foto compartida — ¡gracias!',
  photoUploadError: 'Error al subir. Por favor intenta de nuevo.',
  songRequests: 'Solicitudes de canciones',
  buildOurPlaylist: 'Construye nuestra playlist',
  yourName: 'Tu nombre',
  songTitle: 'Título de la canción',
  artistLabel: 'Artista',
  addSong: 'Agregar',
  songAdded: '¡Canción agregada — gracias!',
  songAddError: 'Error al agregar. Por favor intenta de nuevo.',
  noSongsYet: 'Sin solicitudes aún. ¡Sé el primero!',
  requestedBy: 'Solicitado por',
};

const map: Record<string, Translations> = { en, fr, es };

export function getTranslations(language?: string): Translations {
  return map[language ?? 'en'] ?? en;
}

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];
