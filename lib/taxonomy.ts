export const CATEGORIES = [
  { key: 'mental', label: 'Mental health', icon: '🧠', description: 'Therapists, counselors, and psychologists providing talk therapy and emotional support.' },
  { key: 'psychiatric', label: 'Psychiatric care', icon: '💊', description: 'Psychiatrists and prescribers for diagnosis and medication management.' },
  { key: 'addiction', label: 'Addiction & recovery', icon: '🔄', description: 'Substance use, behavioral addiction, and recovery support services.' },
  { key: 'medical', label: 'Medical / primary care', icon: '🩺', description: 'Primary care providers, family medicine, and general medical care.' },
  { key: 'specialist', label: 'Medical specialist', icon: '🔬', description: 'Specialty physicians like cardiology, neurology, and endocrinology.' },
  { key: 'holistic', label: 'Holistic / integrative', icon: '🌿', description: 'Acupuncture, functional medicine, naturopathy, and integrative care.' },
  { key: 'nutrition', label: 'Nutrition & dietetics', icon: '🍎', description: 'Dietitians and nutritionists for medical and wellness nutrition.' },
  { key: 'speech', label: 'Speech-language', icon: '🗣️', description: 'Speech-language pathologists for communication and swallowing.' },
  { key: 'occupational', label: 'Occupational therapy', icon: '✋', description: 'OTs supporting daily function, development, and rehabilitation.' },
  { key: 'testing', label: 'Testing & assessment', icon: '📋', description: 'Psychological, educational, and neuropsychological evaluations.' },
  { key: 'physical', label: 'Physical & rehab', icon: '🏃', description: 'Physical therapists for injury, pain, and movement rehabilitation.' },
  { key: 'bodywork', label: 'Bodywork & somatic', icon: '🤲', description: 'Massage, craniosacral, and hands-on manual bodywork therapies.' },
  { key: 'movement', label: 'Movement & mind-body', icon: '🧘', description: 'Therapeutic yoga, conscious dance, tai chi, qigong, and breathwork.' },
  { key: 'expressive', label: 'Expressive & creative therapies', icon: '🎨', description: 'Credentialed art, music, dance/movement, and drama therapists.' },
  { key: 'coaching', label: 'Coaching & wellness guidance', icon: '🧭', description: 'Life, health, and wellness coaches supporting goals and growth.' },
  { key: 'developmental', label: 'Developmental & behavioral', icon: '🧩', description: 'ABA, early intervention, and behavioral support for development.' },
  { key: 'reproductive', label: 'Reproductive & perinatal', icon: '🤱', description: 'Doulas, midwives, lactation, fertility, and pelvic health.' },
  { key: 'audiology', label: 'Audiology & hearing', icon: '👂', description: 'Hearing assessment, hearing aids, and auditory care.' },
  { key: 'vision', label: 'Vision & eye care', icon: '👁️', description: 'Optometry, vision therapy, and low-vision rehabilitation.' },
  { key: 'dental', label: 'Dental & oral health', icon: '🦷', description: 'General, pediatric, and specialty dental and oral care.' },
  { key: 'palliative', label: 'End-of-life & palliative', icon: '🕊️', description: 'Hospice, palliative care, death doulas, and grief support.' },
  { key: 'casemgmt', label: 'Case management & social services', icon: '🤝', description: 'Care coordination, benefits navigation, and resource linkage.' },
  { key: 'peer', label: 'Peer & community', icon: '👥', description: 'Peer support specialists, recovery coaches, and community health workers.' },
] as const
export const POPULATIONS = [
  'Veterans', 'Active military', 'Military families', 'First responders',
  'LGBTQ+', 'Transgender / nonbinary', 'BIPOC', 'Black / African American',
  'Latino / Hispanic', 'Asian / Pacific Islander', 'Indigenous / Native American',
  'Immigrants / refugees', 'Undocumented community', 'Multilingual / non-English speakers',
  'Deaf / hard of hearing', 'Blind / low vision', 'People with disabilities',
  'Neurodivergent / autistic adults', 'Chronic illness', 'Cancer patients & survivors',
  'College / university students', 'Teens & adolescents', 'New & expecting parents',
  'Older adults / seniors', 'Caregivers', 'Foster & adoptive families',
  'Justice-involved / reentry', 'People experiencing homelessness',
  'Low-income / uninsured', 'Survivors of abuse / domestic violence',
  'Survivors of sexual assault', 'Grief & loss', 'Faith communities',
  'Interfaith / secular', 'Sex workers', 'Polyamorous / non-monogamous',
  'Adoptees', 'Twice exceptional (2e)', 'HIV+ community',
]
export const TAGS: Record<string, { title: string; options: string[] }[]> = {
  mental: [
    { title: 'Presenting concerns', options: ['Anxiety / stress', 'Panic attacks', 'Depression / mood', 'Bipolar', 'Trauma / PTSD', 'Complex trauma (C-PTSD)', 'Grief / loss', 'Relationship / couples issues', 'Family conflict', 'Divorce / separation', 'Parenting support', 'Life transitions', 'Self-esteem / identity', 'OCD', 'Phobias', 'Perinatal / postpartum', 'Anger management', 'Caregiver burnout', 'Chronic illness adjustment', 'Chronic pain', 'Sleep / insomnia', 'Eating concerns / body image', 'Disordered eating', 'Sexual concerns / intimacy', 'Sexuality & gender identity', "Men's issues", "Women's issues", 'Work / career stress', 'Burnout', 'Academic / school stress', 'Financial stress', 'Religious / spiritual concerns', 'Religious trauma', 'Racial / cultural identity', 'Immigration / acculturation', 'Dissociation', 'Self-harm', 'Attachment issues', 'Codependency', 'Highly sensitive person (HSP)', 'Neurodivergence / ADHD support', 'Autism support'] },
    { title: 'Therapeutic approaches', options: ['CBT', 'DBT', 'ACT', 'EMDR', 'Somatic experiencing', 'Sensorimotor psychotherapy', 'Internal family systems (IFS)', 'Brainspotting', 'Emotionally focused therapy (EFT)', 'Gottman method', 'Psychodynamic', 'Psychoanalytic', 'Mindfulness-based (MBCT / MBSR)', 'Narrative therapy', 'Solution-focused brief therapy', 'Humanistic / person-centered', 'Existential', 'Gestalt', 'Motivational interviewing', 'Play therapy', 'Sandtray', 'Art-based', 'TF-CBT (trauma-focused)', 'CPT (cognitive processing)', 'Prolonged exposure', 'Exposure & response prevention (ERP)', 'Schema therapy', 'Attachment-based', 'Relational', 'Feminist therapy', 'Multicultural / liberation', 'Faith-integrated', 'Ketamine-assisted psychotherapy', 'Parts work', 'Polyvagal-informed', 'Neurofeedback', 'Hypnotherapy'] },
    { title: 'Service format', options: ['Individual therapy', 'Couples therapy', 'Family therapy', 'Group therapy', 'Intensive outpatient', 'Psychoeducation groups', 'Walk-and-talk therapy', 'Telehealth'] },
  ],
  psychiatric: [
    { title: 'Diagnosis areas', options: ['Mood disorders', 'ADHD / ADD', 'Anxiety disorders', 'Psychotic disorders', 'Bipolar spectrum', 'PTSD / trauma', 'OCD spectrum', 'Eating disorders', 'Dual diagnosis', 'Personality disorders'] },
    { title: 'Treatment modalities', options: ['Medication management', 'Medication + therapy', 'Diagnostic evaluation', 'Second opinion', 'Child / adolescent psychiatry', 'Geriatric psychiatry', 'Perinatal psychiatry', 'TMS', 'Ketamine / esketamine'] },
  ],
  addiction: [
    { title: 'Substance / behavior focus', options: ['Alcohol', 'Opioids / fentanyl', 'Stimulants', 'Cannabis', 'Benzodiazepines', 'Nicotine / tobacco', 'Gambling', 'Eating / food', 'Sex & pornography', 'Gaming / technology', 'Co-occurring disorders'] },
    { title: 'Treatment approach', options: ['Outpatient counseling', 'Intensive outpatient (IOP)', 'Medication-assisted treatment (MAT)', 'Harm reduction', '12-step compatible', 'SMART Recovery', 'Peer recovery support', 'Family systems', 'Faith-based recovery', 'Relapse prevention'] },
    { title: 'Recovery stage', options: ['Early recovery (0–90 days)', 'Active treatment', 'Sustained recovery', 'Relapse support', 'Re-entry / justice-involved'] },
  ],
  medical: [
    { title: 'Care focus', options: ['Preventive / wellness', 'Chronic disease management', "Women's health", "Men's health", 'Pediatrics', 'Geriatrics', 'LGBTQ+ affirming care', 'Reproductive health', 'Refugee & immigrant health', 'Underserved populations'] },
    { title: 'Chronic conditions', options: ['Diabetes', 'Hypertension', 'Heart disease', 'Autoimmune', 'Thyroid / endocrine', 'Obesity / metabolic', 'Chronic pain', 'Asthma / pulmonary', 'HIV / infectious disease', 'Cancer survivorship'] },
  ],
  specialist: [
    { title: 'Specialty discipline', options: ['Cardiology', 'Neurology', 'Gastroenterology', 'Endocrinology', 'Orthopedics', 'Dermatology', 'Rheumatology', 'Pulmonology', 'Oncology', 'Pain management', 'Urology', 'Gynecology / OB', 'Infectious disease', 'Nephrology'] },
  ],
  holistic: [
    { title: 'Modality', options: ['Acupuncture (TCM)', 'Functional medicine', 'Naturopathic medicine', 'Chiropractic care', 'Herbal / botanical medicine', 'Homeopathy', 'Ayurvedic medicine', 'Energy healing (Reiki)', 'Mind-body medicine', 'Integrative oncology'] },
    { title: 'Wellness focus', options: ['Chronic pain', 'Hormone balance', 'Gut / digestive health', 'Immune support', 'Stress & nervous system', 'Detoxification', "Women's health / fertility", 'Sleep optimization', 'Metabolic / weight health'] },
  ],
  nutrition: [
    { title: 'Nutrition focus', options: ['Eating disorder recovery', 'Disordered eating', 'Diabetes / metabolic', 'Heart health', 'Gut / GI health', 'Sports & performance', 'Pediatric nutrition', 'Prenatal / postnatal', 'Oncology nutrition', 'Renal / kidney', 'Food allergy / intolerance', 'Plant-based'] },
    { title: 'Care philosophy', options: ['Health at every size (HAES)', 'Weight-neutral / anti-diet', 'Intuitive eating', 'Medical nutrition therapy', 'Functional nutrition', 'Eating disorder-informed', 'Trauma-informed'] },
  ],
  speech: [
    { title: 'Area of practice', options: ['Articulation / phonology', 'Language delay / disorder', 'Fluency / stuttering', 'Voice & resonance', 'Swallowing / dysphagia', 'Augmentative communication (AAC)', 'Aphasia', 'Autism spectrum (communication)', 'Social pragmatic communication', 'Selective mutism', 'Accent modification'] },
    { title: 'Setting', options: ['Outpatient clinic', 'Teletherapy', 'Home-based / early intervention', 'School-based', 'Hospital / acute care', 'SNF / long-term care'] },
  ],
  occupational: [
    { title: 'Area of practice', options: ['Pediatric development', 'Sensory processing / integration', 'Hand therapy', 'Activities of daily living (ADLs)', 'Cognitive rehabilitation', 'Neurological rehab', 'Return-to-work / ergonomics', 'Mental health OT', 'Geriatric / aging in place', 'Feeding therapy', 'Visual-motor / handwriting', 'Assistive technology'] },
    { title: 'Population', options: ['Infants / toddlers', 'Children', 'Adolescents', 'Adults', 'Older adults', 'Stroke / brain injury', 'Autism / developmental'] },
    { title: 'Setting', options: ['Outpatient clinic', 'Teletherapy', 'Home-based / early intervention', 'School-based', 'Hospital / acute care', 'SNF / long-term care'] },
  ],
  testing: [
    { title: 'Assessment type', options: ['Psychoeducational / learning disability', 'ADHD / attention', 'Autism spectrum (ASD)', 'Neuropsychological', 'Gifted / twice exceptional', 'Personality & psychological', 'Forensic / custody', 'Vocational / career', 'Memory & cognitive decline', 'Bilingual / multilingual'] },
    { title: 'Referral questions', options: ['IEP / school eligibility', 'Diagnostic clarification', 'Disability documentation', 'Medication decision support', 'College / workplace accommodations', 'Competency evaluation'] },
  ],
  physical: [
    { title: 'Condition / focus', options: ['Orthopedic / musculoskeletal', 'Neurological rehab', 'Post-surgical rehab', 'Chronic pain', 'Sports injury', 'Pelvic floor', 'Vestibular / balance', 'Lymphedema', 'Pediatric PT', 'Geriatric / fall prevention'] },
    { title: 'Treatment approach', options: ['Manual therapy', 'Dry needling', 'Functional movement', 'Aquatic therapy', 'Pilates-based PT', 'Ergonomics', 'Tai chi / movement therapy'] },
  ],
  bodywork: [
    { title: 'Modality', options: ['Massage therapy (LMT)', 'Craniosacral therapy', 'Rolfing / structural integration', 'Myofascial release', 'Reflexology', 'Shiatsu', 'Thai massage', 'Lymphatic drainage', 'Oncology massage', 'Medical massage', 'Trigger point therapy'] },
    { title: 'Therapeutic context', options: ['Chronic pain', 'Stress & relaxation', 'Trauma-sensitive', 'Athletic recovery', 'Prenatal / postpartum', 'Palliative / end-of-life', 'Oncology support', 'LGBTQ+ affirming'] },
  ],
  movement: [
    { title: 'Practice', options: ['Therapeutic yoga', 'Trauma-informed yoga', 'Yoga therapy (C-IAYT)', 'Conscious / somatic dance', '5Rhythms', 'Authentic movement', 'Tai chi', 'Qigong', 'Breathwork', 'Pilates-based wellness', 'Feldenkrais', 'Alexander technique', 'Somatic movement education'] },
    { title: 'Focus & context', options: ['Stress & nervous system regulation', 'Trauma recovery', 'Chronic pain', 'Grief & loss', 'Embodiment', 'Anxiety & depression', 'Prenatal / postpartum', 'Older adults', 'Group classes', 'Individual sessions', 'LGBTQ+ affirming'] },
  ],
  expressive: [
    { title: 'Modality', options: ['Art therapy (credentialed)', 'Music therapy (MT-BC)', 'Dance / movement therapy (credentialed)', 'Drama therapy', 'Expressive arts therapy', 'Poetry / writing therapy', 'Play therapy', 'Sandtray therapy'] },
    { title: 'Population & focus', options: ['Children', 'Adolescents', 'Adults', 'Older adults', 'Trauma / PTSD', 'Grief & loss', 'Autism / developmental', 'Dementia / memory care', 'Medical / hospital settings', 'Group work'] },
  ],
  coaching: [
    { title: 'Coaching type', options: ['Life coaching', 'Health & wellness coaching', 'Mental fitness coaching', 'ADHD coaching', 'Career coaching', 'Executive / leadership coaching', 'Relationship coaching', 'Recovery / sobriety coaching', 'Spiritual coaching', 'Grief coaching', 'Parent coaching', 'Accountability coaching'] },
    { title: 'Focus area', options: ['Goal-setting & motivation', 'Habit change', 'Stress & burnout', 'Work-life balance', 'Life transitions', 'Confidence & self-worth', 'Purpose & meaning', 'Nutrition & lifestyle', 'Mindset', 'LGBTQ+ affirming'] },
    { title: 'Credential (if any)', options: ['ICF certified (ACC/PCC/MCC)', 'National Board Certified Health Coach (NBC-HWC)', 'Certified through training program', 'Peer / lived experience'] },
  ],
  developmental: [
    { title: 'Service type', options: ['Applied behavior analysis (ABA)', 'Early intervention', 'Developmental assessment', 'Behavioral support', 'Parent training / coaching', 'Social skills groups', 'Feeding / toileting support', 'Adaptive skills'] },
    { title: 'Population', options: ['Autism spectrum', 'Intellectual / developmental disability', 'ADHD', 'Down syndrome', 'Genetic / congenital conditions', 'Infants / toddlers', 'School-age children', 'Adolescents', 'Adults with IDD'] },
  ],
  reproductive: [
    { title: 'Service type', options: ['Birth doula', 'Postpartum doula', 'Midwifery', 'Lactation consultant (IBCLC)', 'Childbirth education', 'Fertility support', 'Pelvic floor health', 'Prenatal care', 'Postpartum support', 'Pregnancy / infant loss support', 'Perinatal mental health'] },
    { title: 'Approach & focus', options: ['Trauma-informed birth', 'LGBTQ+ affirming', 'VBAC support', 'High-risk pregnancy', 'Home birth', 'Hospital birth', 'Surrogacy / IVF support', 'Adoption support'] },
  ],
  audiology: [
    { title: 'Service type', options: ['Hearing assessment / testing', 'Hearing aids', 'Cochlear implants', 'Tinnitus management', 'Auditory processing', 'Balance / vestibular', 'Pediatric audiology', 'Hearing protection', 'Aural rehabilitation'] },
    { title: 'Population', options: ['Infants / toddlers', 'Children', 'Adults', 'Older adults', 'Deaf / hard of hearing community'] },
  ],
  vision: [
    { title: 'Service type', options: ['Comprehensive eye exam', 'Vision therapy', 'Low-vision rehabilitation', 'Pediatric optometry', 'Contact lenses', 'Glaucoma / disease management', 'Developmental / learning-related vision', 'Sports vision', 'Neuro-optometric rehab'] },
    { title: 'Population', options: ['Children', 'Adults', 'Older adults', 'Brain injury / stroke', 'Developmental / learning'] },
  ],
  dental: [
    { title: 'Service type', options: ['General dentistry', 'Pediatric dentistry', 'Orthodontics', 'Periodontics', 'Oral surgery', 'Endodontics', 'Prosthodontics', 'Preventive / hygiene', 'Cosmetic dentistry', 'Special needs dentistry', 'Sleep apnea / oral appliances'] },
    { title: 'Access & focus', options: ['Sliding scale / low-cost', 'Medicaid accepted', 'Sedation dentistry', 'Dental anxiety / phobia', 'Geriatric dental care'] },
  ],
  palliative: [
    { title: 'Service type', options: ['Palliative care', 'Hospice care', 'Death doula / end-of-life doula', 'Bereavement / grief support', 'Advance care planning', 'Pain & symptom management', 'Caregiver support', 'Pediatric palliative care', 'Spiritual / existential support'] },
    { title: 'Setting & focus', options: ['Home-based', 'Hospital / inpatient', 'Facility-based', 'Trauma-informed grief', 'Complicated grief', 'Child / family loss', 'Anticipatory grief'] },
  ],
  casemgmt: [
    { title: 'Service type', options: ['Care coordination', 'Benefits navigation', 'Housing / resource coordination', 'Disability services', 'Discharge planning', 'Non-clinical social work', 'Patient advocacy', 'Insurance navigation', 'Crisis support / linkage'] },
    { title: 'Population served', options: ['Older adults', 'People with disabilities', 'Unhoused / housing-insecure', 'Justice-involved / re-entry', 'Immigrant & refugee', 'Veterans', 'Chronic illness', 'Low-income / uninsured', 'Families & caregivers'] },
  ],
  peer: [
    { title: 'Role / credential', options: ['Certified Peer Support Specialist (CPS)', 'Recovery coach', 'Community health worker (CHW)', 'Patient / health navigator', 'Family peer support', 'Promotora'] },
    { title: 'Support type', options: ['Mental health peer support', 'Recovery peer support', 'Chronic illness peer support', 'Caregiver support', 'Grief support', 'Re-entry / justice peer support', 'Youth peer mentoring', 'Senior peer support', 'Veteran peer support'] },
    { title: 'Format', options: ['Individual peer mentoring', 'Group (in-person)', 'Group (virtual)', 'Drop-in / open access', 'Community center-based', 'Faith-community based', 'Mobile / street outreach'] },
  ],
}

export const INSURANCE_OPTIONS = ['BCBS', 'Aetna', 'Cigna', 'Medicaid (SC)', 'Medicare', 'Tricare', 'ChampVa', 'United / Optum', 'Humana', 'Self-pay', 'Sliding scale', 'HSA / FSA', 'Superbill / Out-of-network', 'We do not take insurance']

export const AGE_GROUPS = ['Infants / toddlers (0–3)', 'Children (4–12)', 'Adolescents (13–17)', 'Young adults (18–25)', 'Adults (26–64)', 'Older adults (65+)', 'Lifespan / all ages']

export const IDENTITY_TAGS = ['LGBTQ+ affirming', 'Trans & nonbinary affirming', 'Black / African American community', 'Latino / Hispanic community', 'Asian / Pacific Islander community', 'Indigenous / Native American community', 'Faith-integrated care', 'Trauma-informed', 'Neurodivergent-affirming', 'Disability-affirming', 'Spanish-speaking', 'Weight-neutral / HAES']