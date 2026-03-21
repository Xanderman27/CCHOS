'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    'header.title': "Children's Health Community Request Form",
    'header.subtitle': 'Visit our website for more information!',
    'header.website': 'https://intermountainhealthcare.org/childrens-health/wellness-prevention',
    'header.gunlocks': 'If you would like to order gun locks, visit this website.',
    'header.gunlocks_url': 'https://ihmacx.sjc1.qualtrics.com/jfe/form/SV_b77pXOgQHJcQSWO',

    // Language
    'lang.toggle': 'Español',
    'lang.current': 'English',

    // Form fields
    'form.contactInfo': 'Contact Information',
    'form.name': 'Name',
    'form.name.placeholder': 'Your full name',
    'form.organization': 'Organization',
    'form.organization.placeholder': 'Your organization name',
    'form.email': 'Email',
    'form.email.placeholder': 'your.email@example.com',
    'form.requestType': 'What type of event support are you requesting?',
    'form.requestType.mailing': 'Mailing of education materials or safety devices',
    'form.requestType.mailing.desc': 'We\'ll ship free community education resources and safety tools directly to your organization.',
    'form.requestType.in_person': 'Community Health In-Person Support at event with education materials or safety devices',
    'form.requestType.in_person.desc': 'Our team will attend your event to provide presentations, education materials, and safety devices. Available within our service area.',
    'form.requestType.virtual': 'Virtual Presentation',
    'form.requestType.virtual.desc': 'Request a free virtual presentation on child safety, injury prevention, or emotional well-being for your group.',
    'form.requestType.pickup': 'Pickup of education materials or safety devices',
    'form.requestType.pickup.desc': 'Schedule a time to pick up free education materials and safety devices from our office.',
    'pickup.dateNeeded': 'When do you need the materials?',
    'form.additionalNotes': 'Additional notes? Anything else we should know?',
    'form.additionalNotes.placeholder': 'Any special instructions, accessibility needs, or other information...',
    'form.submit': 'Submit Request',
    'form.submitting': 'Submitting...',
    'form.required': 'Required',

    // Mailing fields
    'mailing.materials': 'What Health, Wellness, and Injury Prevention resources would you like?',
    'mailing.materials.description': 'Please feel free to mark multiple. Use this link to learn more as you decide.',
    'mailing.quantity': 'Number Requested for each item',
    'mailing.qty': 'Qty',
    'mailing.state': 'State',
    'mailing.state.placeholder': 'Select your state',
    'mailing.county': 'County',
    'mailing.county.placeholder': 'Enter your county',
    'mailing.address': 'Address',
    'mailing.address.placeholder': 'Full shipping address',
    'mailing.dateNeeded': 'Date needed?',

    // Event fields
    'event.date': 'Date of event',
    'event.startEndTime': 'Beginning and End Time of Event',
    'event.startTime': 'Start Time',
    'event.endTime': 'End Time',
    'event.address': 'What is the address of the event? Is it indoor or outdoor? Are there specific parking instructions?',
    'event.address.placeholder': 'Event address',
    'event.indoorOutdoor': 'Indoor or Outdoor?',
    'event.indoor': 'Indoor',
    'event.outdoor': 'Outdoor',
    'event.parking': 'Parking Instructions',
    'event.parking.placeholder': 'Any specific parking instructions...',
    'event.audience': 'What is your target audience type?',
    'event.attendees': 'What is the estimated number of attendees?',
    'event.attendees.placeholder': 'Estimated number',
    'event.topics': 'What Health, Wellness, and Injury Prevention topics would you like covered?',
    'event.topics.description': 'Please feel free to mark multiple. Use this link to learn more as you decide.',
    'event.attending': 'Will you be attending this event?',
    'event.yes': 'Yes',
    'event.no': 'No',

    // Validation
    'validation.required': 'This field is required',
    'validation.email': 'Please enter a valid email address',
    'validation.selectMaterials': 'Please select at least one material',
    'validation.selectTopics': 'Please select at least one topic',

    // Success
    'success.title': 'Request Submitted Successfully',
    'success.message': 'Thank you for your request. Our team will review it and get back to you shortly.',
    'success.requestId': 'Your request ID is',
    'success.newRequest': 'Submit Another Request',
  },
  es: {
    // Header
    'header.title': 'Formulario de solicitud comunitaria de Children\'s Health',
    'header.subtitle': '¡Visite nuestra página web para más información!',
    'header.website': 'https://intermountainhealthcare.org/childrens-health/wellness-prevention',
    'header.gunlocks': 'Si deseas pedir candados para armas, visita este sitio web.',
    'header.gunlocks_url': 'https://ihmacx.sjc1.qualtrics.com/jfe/form/SV_b77pXOgQHJcQSWO',

    // Language
    'lang.toggle': 'English',
    'lang.current': 'Español',

    // Form fields
    'form.contactInfo': 'Información de Contacto',
    'form.name': 'Nombre',
    'form.name.placeholder': 'Su nombre completo',
    'form.organization': 'Organización',
    'form.organization.placeholder': 'Nombre de su organización',
    'form.email': 'Correo Electrónico',
    'form.email.placeholder': 'su.correo@ejemplo.com',
    'form.requestType': '¿Qué tipo de apoyo de evento estás solicitando?',
    'form.requestType.mailing': 'Envío de materiales educativos o aparatos de seguridad',
    'form.requestType.mailing.desc': 'Enviaremos recursos educativos comunitarios gratuitos y herramientas de seguridad directamente a su organización.',
    'form.requestType.in_person': 'Apoyo en persona de Salud Comunitaria en el evento con materiales educativos o aparatos de seguridad',
    'form.requestType.in_person.desc': 'Nuestro equipo asistirá a su evento para ofrecer presentaciones, materiales educativos y aparatos de seguridad. Disponible dentro de nuestra área de servicio.',
    'form.requestType.virtual': 'Presentación Virtual',
    'form.requestType.virtual.desc': 'Solicite una presentación virtual gratuita sobre seguridad infantil, prevención de lesiones o bienestar emocional para su grupo.',
    'form.requestType.pickup': 'Recogida de materiales educativos o aparatos de seguridad',
    'form.requestType.pickup.desc': 'Programe un horario para recoger materiales educativos gratuitos y aparatos de seguridad en nuestra oficina.',
    'pickup.dateNeeded': '¿Cuándo necesita los materiales?',
    'form.additionalNotes': '¿Notas adicionales? ¿Algo más que debamos saber?',
    'form.additionalNotes.placeholder': 'Instrucciones especiales, necesidades de accesibilidad u otra información...',
    'form.submit': 'Enviar Solicitud',
    'form.submitting': 'Enviando...',
    'form.required': 'Obligatorio',

    // Mailing fields
    'mailing.materials': '¿Qué recursos de Salud, Bienestar y Prevención de Lesiones le gustaría?',
    'mailing.materials.description': 'Por favor, siéntase libre de marcar varios. Utilice este enlace para obtener más información.',
    'mailing.quantity': 'Número solicitado de cada artículo',
    'mailing.qty': 'Cant.',
    'mailing.state': 'Estado',
    'mailing.state.placeholder': 'Seleccione su estado',
    'mailing.county': 'Condado',
    'mailing.county.placeholder': 'Ingrese su condado',
    'mailing.address': 'Dirección',
    'mailing.address.placeholder': 'Dirección de envío completa',
    'mailing.dateNeeded': '¿Para qué fecha?',

    // Event fields
    'event.date': 'Día del evento',
    'event.startEndTime': 'Hora de inicio y finalización del evento',
    'event.startTime': 'Hora de Inicio',
    'event.endTime': 'Hora de Fin',
    'event.address': '¿Cuál es la dirección del evento? ¿Es adentro o afuera? ¿Existen instrucciones específicas de estacionamiento?',
    'event.address.placeholder': 'Dirección del evento',
    'event.indoorOutdoor': '¿Adentro o Afuera?',
    'event.indoor': 'Adentro',
    'event.outdoor': 'Afuera',
    'event.parking': 'Instrucciones de Estacionamiento',
    'event.parking.placeholder': 'Instrucciones específicas de estacionamiento...',
    'event.audience': '¿Cuál es su tipo de público objetivo?',
    'event.attendees': '¿Cuál es el número estimado de asistentes?',
    'event.attendees.placeholder': 'Número estimado',
    'event.topics': '¿Qué temas de Salud, Bienestar y Prevención de Lesiones le gustaría cubrir?',
    'event.topics.description': 'Por favor, siéntase libre de marcar varios. Utilice este enlace para obtener más información.',
    'event.attending': '¿Asistirás a este evento?',
    'event.yes': 'Sí',
    'event.no': 'No',

    // Validation
    'validation.required': 'Este campo es obligatorio',
    'validation.email': 'Por favor ingrese un correo electrónico válido',
    'validation.selectMaterials': 'Por favor seleccione al menos un material',
    'validation.selectTopics': 'Por favor seleccione al menos un tema',

    // Success
    'success.title': 'Solicitud Enviada Exitosamente',
    'success.message': 'Gracias por su solicitud. Nuestro equipo la revisará y se comunicará con usted pronto.',
    'success.requestId': 'Su número de solicitud es',
    'success.newRequest': 'Enviar Otra Solicitud',
  },
};

interface I18nContextValue {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || translations['en'][key] || key;
    },
    [locale]
  );

  return React.createElement(
    I18nContext.Provider,
    { value: { locale, t, setLocale } },
    children
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
