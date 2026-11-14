import type { FormStep, FlowType } from '../../../shared/schemas/step.schema';

/**
 * Step catalog for the "onboarding" flow.
 * Guides refugees, persons with disabilities, and job seekers through
 * accessible, one-question-per-screen profile creation.
 */
export const ONBOARDING_STEPS: FormStep[] = [
  {
    stepId: 'onboarding_full_name',
    flow: 'onboarding',
    type: 'text',
    label: {
      en: 'What is your full legal or preferred name?',
      am: 'ሙሉ ወይም ተመራጭ ስምዎ ማን ይባላል?',
    },
    simpleLabel: {
      en: 'Your Name',
      am: 'ስምዎ',
    },
    icon: 'user',
    allowVoiceInput: true,
    required: true,
  },
  {
    stepId: 'onboarding_birth_date',
    flow: 'onboarding',
    type: 'date_ethiopian',
    label: {
      en: 'What is your date of birth in the Ethiopian calendar?',
      am: 'የትውልድ ቀንዎን በኢትዮጵያ ዘመን አቆጣጠር ያስገቡ',
    },
    simpleLabel: {
      en: 'Your Birthday (Ethiopian Calendar)',
      am: 'የተወለዱበት ቀን (በኢትዮጵያ አቆጣጠር)',
    },
    icon: 'calendar',
    allowVoiceInput: false,
    required: true,
  },
  {
    stepId: 'onboarding_verification_document',
    flow: 'onboarding',
    type: 'file_or_referral',
    label: {
      en: 'Select your verification document or request an accredited partner referral (e.g., AAAPD)',
      am: 'የማረጋገጫ ሰነድዎን ይምረጡ ወይም የታወቀ አጋር ድርጅት ሪፈራል ይጠይቁ (ለምሳሌ፦ AAAPD)',
    },
    simpleLabel: {
      en: 'ID Document or Partner Referral',
      am: 'መታወቂያ ወይም የአጋር ድርጅት ማረጋገጫ',
    },
    icon: 'document',
    allowVoiceInput: false,
    required: true,
  },
  {
    stepId: 'onboarding_support_needs',
    flow: 'onboarding',
    type: 'support_tags',
    label: {
      en: 'Which workplace or learning accommodations do you need? (No medical proof required)',
      am: 'ምን ዓይነት የሥራ ቦታ ወይም የመማሪያ ማመቻቻ ድጋፎች ያስፈልጉዎታል? (የሕክምና ማስረጃ አያስፈልግም)',
    },
    simpleLabel: {
      en: 'Help You Need at Work',
      am: 'የሚያስፈልግዎት ድጋፍ',
    },
    icon: 'support',
    allowVoiceInput: false,
    required: false,
  },
  {
    stepId: 'onboarding_contact_channel',
    flow: 'onboarding',
    type: 'choice',
    label: {
      en: 'How would you like our team to contact you?',
      am: 'ቡድናችን በምን መንገድ ቢያገኝዎት ይመረጣሉ?',
    },
    simpleLabel: {
      en: 'Best Way to Contact You',
      am: 'እንዴት እንደውልዎ?',
    },
    icon: 'phone',
    allowVoiceInput: false,
    required: true,
    options: [
      {
        value: 'phone_call',
        label: {
          en: 'Direct phone call',
          am: 'የስልክ ጥሪ',
        },
        simpleLabel: {
          en: 'Phone Call',
          am: 'በስልክ',
        },
      },
      {
        value: 'sms_text',
        label: {
          en: 'SMS text message',
          am: 'የአጭር የጽሑፍ መልእክት (SMS)',
        },
        simpleLabel: {
          en: 'Text Message',
          am: 'በአጭር ጽሑፍ',
        },
      },
      {
        value: 'telegram',
        label: {
          en: 'Telegram messenger',
          am: 'የቴሌግራም መልእክት',
        },
        simpleLabel: {
          en: 'Telegram',
          am: 'በቴሌግራም',
        },
      },
      {
        value: 'community_center',
        label: {
          en: 'In-person notification at local community center',
          am: 'በአካባቢው ማህበረሰብ ማዕከል በአካል',
        },
        simpleLabel: {
          en: 'Community Center',
          am: 'በማዕከል በአካል',
        },
      },
    ],
  },
];

/**
 * Step catalog for the "job_apply" flow.
 * Allows candidates to quickly apply for jobs with dignity, zero medical inquiries,
 * and direct accommodation preferences.
 */
export const JOB_APPLY_STEPS: FormStep[] = [
  {
    stepId: 'job_role_focus',
    flow: 'job_apply',
    type: 'choice',
    label: {
      en: 'Which job area or skills track matches your interest?',
      am: 'የሥራ ፍላጎትዎ ወይም የክህሎት ዘርፍዎ የትኛው ነው?',
    },
    simpleLabel: {
      en: 'Job You Want',
      am: 'የሚፈልጉት ሥራ',
    },
    icon: 'briefcase',
    allowVoiceInput: false,
    required: true,
    options: [
      {
        value: 'data_entry',
        label: {
          en: 'Digital data entry & document processing',
          am: 'የዲጂታል መረጃ ማስገባትና ሰነድ ማዘጋጀት',
        },
        simpleLabel: {
          en: 'Data Entry (Computer)',
          am: 'ኮምፒውተር ጽሕፈት',
        },
      },
      {
        value: 'customer_support',
        label: {
          en: 'Customer support, phone, or messaging assistance',
          am: 'የደንበኞች አገልግሎትና የስልክ ድጋፍ',
        },
        simpleLabel: {
          en: 'Customer Help',
          am: 'የደንበኛ አገልግሎት',
        },
      },
      {
        value: 'language_translation',
        label: {
          en: 'Translation and language interpretation (Amharic, English, Tigrinya, Oromo, Somali)',
          am: 'የትርጉም እና የቋንቋ አገልግሎት',
        },
        simpleLabel: {
          en: 'Language Translation',
          am: 'ቋንቋ መተርጎም',
        },
      },
      {
        value: 'crafts_assembly',
        label: {
          en: 'Handicrafts, light packaging, or workshop assembly',
          am: 'የእጅ ሥራዎች፣ እሽግ እና አነስተኛ ማምረቻ',
        },
        simpleLabel: {
          en: 'Crafts & Hands-on Work',
          am: 'የእጅ ሙያ ሥራ',
        },
      },
    ],
  },
  {
    stepId: 'job_skills_summary',
    flow: 'job_apply',
    type: 'text',
    label: {
      en: 'Describe your skills or previous experience (you can speak or type)',
      am: 'ያለዎትን የክህሎት ወይም የሥራ ልምድ ባጭሩ ይግለጹ (በድምጽ መናገር ወይም መጻፍ ይችላሉ)',
    },
    simpleLabel: {
      en: 'Your Experience',
      am: 'የሥራ ልምድዎ',
    },
    icon: 'user',
    allowVoiceInput: true,
    required: true,
  },
  {
    stepId: 'job_credentials_referral',
    flow: 'job_apply',
    type: 'file_or_referral',
    label: {
      en: 'Attach your CV, certificate, Refugee ID, or select an accredited community referral',
      am: 'ሲቪ፣ የምስክር ወረቀት፣ የስደተኛ መታወቂያ ወይም የታመነ የአጋር ሪፈራል ይምረጡ',
    },
    simpleLabel: {
      en: 'CV, Certificate, or Referral',
      am: 'ሲቪ ወይም ማረጋገጫ',
    },
    icon: 'document',
    allowVoiceInput: false,
    required: false,
  },
  {
    stepId: 'job_interview_accommodations',
    flow: 'job_apply',
    type: 'support_tags',
    label: {
      en: 'Which interview or workplace accommodations do you need? (Privacy guaranteed)',
      am: 'ለምልመላ ቃለ-መጠይቅ ወይም ለሥራ ቦታ ምን ማመቻቻዎች ያስፈልጉዎታል? (ምስጢራዊነቱ የተጠበቀ)',
    },
    simpleLabel: {
      en: 'Help for Interview & Work',
      am: 'ለቃለ-መጠይቅ የሚያስፈልግ ድጋፍ',
    },
    icon: 'support',
    allowVoiceInput: false,
    required: false,
  },
  {
    stepId: 'job_workplace_preference',
    flow: 'job_apply',
    type: 'choice',
    label: {
      en: 'What work arrangement suits your circumstances best?',
      am: 'የትኛው የሥራ ሁኔታ ለሁኔታዎ ይበልጥ ተስማሚ ነው?',
    },
    simpleLabel: {
      en: 'Where You Work',
      am: 'የሥራ ቦታ ምርጫ',
    },
    icon: 'building',
    allowVoiceInput: false,
    required: true,
    options: [
      {
        value: 'remote_home',
        label: {
          en: 'Fully remote (working from home or community hub)',
          am: 'ሙሉ በሙሉ ከቤት ወይም ከማህበረሰብ ማዕከል',
        },
        simpleLabel: {
          en: 'Work from Home',
          am: 'ከቤት መሥራት',
        },
      },
      {
        value: 'hybrid',
        label: {
          en: 'Hybrid (part-time remote and part-time on-site)',
          am: 'የተደባለቀ (ከፊል ከቤት እና ከፊል በሥራ ቦታ)',
        },
        simpleLabel: {
          en: 'Hybrid (Home & Office)',
          am: 'የተደባለቀ',
        },
      },
      {
        value: 'onsite_accessible',
        label: {
          en: 'On-site in a step-free accessible workspace',
          am: 'በቀጥታ በሥራ ቦታ (ደረጃ-አልባና አመቺ ቢሮ)',
        },
        simpleLabel: {
          en: 'Accessible Office',
          am: 'በአመቺ ቢሮ',
        },
      },
    ],
  },
];

/**
 * Step catalog for the "employer_accommodation" flow.
 * Empowers inclusive employers to specify their workplace accessibility features
 * and pledge accommodations.
 */
export const EMPLOYER_ACCOMMODATION_STEPS: FormStep[] = [
  {
    stepId: 'emp_company_name',
    flow: 'employer_accommodation',
    type: 'text',
    label: {
      en: 'What is the registered or trade name of your organization?',
      am: 'የድርጅትዎ ወይም የኩባንያዎ ስም ማን ይባላል?',
    },
    simpleLabel: {
      en: 'Company Name',
      am: 'የድርጅቱ ስም',
    },
    icon: 'building',
    allowVoiceInput: true,
    required: true,
  },
  {
    stepId: 'emp_workplace_environment',
    flow: 'employer_accommodation',
    type: 'choice',
    label: {
      en: 'What is the primary physical or digital setup of your workplace?',
      am: 'የድርጅትዎ ዋና የሥራ አካባቢ ዓይነት ምንድን ነው?',
    },
    simpleLabel: {
      en: 'Workplace Type',
      am: 'የሥራ ቦታ ዓይነት',
    },
    icon: 'briefcase',
    allowVoiceInput: false,
    required: true,
    options: [
      {
        value: 'office_physical',
        label: {
          en: 'Physical office / commercial facility',
          am: 'የቢሮ ወይም የንግድ ተቋም',
        },
        simpleLabel: {
          en: 'Office',
          am: 'ቢሮ',
        },
      },
      {
        value: 'workshop_factory',
        label: {
          en: 'Production workshop, artisan space, or light manufacturing',
          am: 'አውደ ጥናት ወይም አነስተኛ ማምረቻ',
        },
        simpleLabel: {
          en: 'Workshop',
          am: 'ማምረቻ/ዎርክሾፕ',
        },
      },
      {
        value: 'remote_first',
        label: {
          en: 'Remote-first or distributed digital team',
          am: 'የርቀት ወይም የዲጂታል ቡድን',
        },
        simpleLabel: {
          en: 'Remote Work',
          am: 'የርቀት ሥራ',
        },
      },
      {
        value: 'hybrid_flexible',
        label: {
          en: 'Flexible hybrid environment',
          am: 'ተለዋዋጭ የተደባለቀ አካባቢ',
        },
        simpleLabel: {
          en: 'Flexible Hybrid',
          am: 'ተለዋዋጭ ሁኔታ',
        },
      },
    ],
  },
  {
    stepId: 'emp_supported_accommodations',
    flow: 'employer_accommodation',
    type: 'support_tags',
    label: {
      en: 'Select all accessibility accommodations your organization currently offers or commits to providing:',
      am: 'ድርጅትዎ በአሁኑ ወቅት የሚያቀርባቸውን ወይም ለማሟላት ዝግጁ የሆኑትን ማመቻቻዎች ይምረጡ፡',
    },
    simpleLabel: {
      en: 'Accommodations You Provide',
      am: 'የምታቀርቧቸው ድጋፎች',
    },
    icon: 'support',
    allowVoiceInput: false,
    required: true,
  },
  {
    stepId: 'emp_inclusion_readiness',
    flow: 'employer_accommodation',
    type: 'choice',
    label: {
      en: 'Would your team benefit from free disability inclusion and accessible onboarding coaching?',
      am: 'ቡድንዎ ነፃ የአካል ጉዳተኝነት ማካተትና አመቺ አሠራር ስልጠና ማግኘት ይፈልጋል?',
    },
    simpleLabel: {
      en: 'Inclusion Coaching',
      am: 'የማካተት ስልጠና',
    },
    icon: 'check',
    allowVoiceInput: false,
    required: true,
    options: [
      {
        value: 'ready_now',
        label: {
          en: 'Ready now – our team is fully trained in accessible hiring',
          am: 'ዝግጁ ነን – ቡድናችን በአካታች ቅጥር የሰለጠነ ነው',
        },
        simpleLabel: {
          en: 'Ready Now',
          am: 'አሁን ዝግጁ ነን',
        },
      },
      {
        value: 'request_aaapd_coaching',
        label: {
          en: 'Yes – we would welcome partnership & coaching from AAAPD / accredited specialists',
          am: 'አዎ – ከ AAAPD ወይም ከአጋሮች ጋር ለመስራትና ስልጠና ለመውሰድ ዝግጁ ነን',
        },
        simpleLabel: {
          en: 'Want Coaching',
          am: 'ስልጠና እንፈልጋለን',
        },
      },
      {
        value: 'information_only',
        label: {
          en: 'Please share written guidelines and best practices first',
          am: 'እባክዎ መጀመሪያ የጽሑፍ መመሪያዎችን ያጋሩን',
        },
        simpleLabel: {
          en: 'Send Guides',
          am: 'መመሪያ ይላኩልን',
        },
      },
    ],
  },
  {
    stepId: 'emp_lead_contact',
    flow: 'employer_accommodation',
    type: 'text',
    label: {
      en: 'Contact person name, phone number, and official email',
      am: 'የእውቂያ ሰው ስም፣ ስልክ ቁጥር እና ኦፊሴላዊ ኢሜይል',
    },
    simpleLabel: {
      en: 'Contact Person & Phone',
      am: 'የእውቂያ ሰው እና ስልክ',
    },
    icon: 'phone',
    allowVoiceInput: true,
    required: true,
  },
];

/**
 * Returns the default step definitions for a given flow.
 */
export function getStepsForFlow(flow: FlowType): FormStep[] {
  switch (flow) {
    case 'onboarding':
      return [...ONBOARDING_STEPS];
    case 'job_apply':
      return [...JOB_APPLY_STEPS];
    case 'employer_accommodation':
      return [...EMPLOYER_ACCOMMODATION_STEPS];
    default:
      return [...ONBOARDING_STEPS];
  }
}
