const { Client, Databases, ID } = require('appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66fad7d00019dfe1b467');

const databases = new Databases(client);

const createPlans = async () => {
  const plans = [
    {
      name: 'Dengue Fever',
      description: 'Hydration is critical to prevent dehydration caused by fever and promote recovery.',
      recommendedIntake: '2.5',
      notes: 'Monitor for severe symptoms (e.g., bleeding, severe pain) and consult a doctor immediately.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Sip electrolyte-rich fluids like oral rehydration solutions.',
        'Drink small amounts frequently to avoid nausea.',
        'Avoid sugary drinks that may worsen dehydration.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.75, time: '18:00', reward: '75% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Hydration Hero Badge' }
      ])
    },
    {
      name: 'Chronic Kidney Disease',
      description: 'Limited water intake to avoid fluid overload, tailored for kidney function.',
      recommendedIntake: '1.5',
      notes: 'Strictly follow your nephrologist’s fluid restrictions, especially if on dialysis.',
      schedule: JSON.stringify({ intervals: 8, amountPerInterval: 0.1875, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Measure intake precisely using a marked bottle.',
        'Coordinate with dialysis schedule; consult nephrologist.',
        'Avoid high-sodium fluids like sports drinks.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.25, time: '10:00', reward: '25% Milestone' },
        { goal: 0.5, time: '15:00', reward: '50% Milestone' },
        { goal: 1.0, time: '20:00', reward: 'Kidney Care Badge' }
      ])
    },
    {
      name: 'Heart Failure',
      description: 'Restricted hydration to prevent fluid retention and reduce heart strain.',
      recommendedIntake: '1.5',
      notes: 'Consult your cardiologist for fluid limits, especially with diuretics.',
      schedule: JSON.stringify({ intervals: 8, amountPerInterval: 0.1875, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Weigh daily to monitor fluid retention; reduce intake if swelling occurs.',
        'Use low-sodium water or herbal teas.',
        'Sip slowly to avoid heart strain.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.3, time: '10:00', reward: '30% Milestone' },
        { goal: 0.6, time: '15:00', reward: '60% Milestone' },
        { goal: 1.0, time: '20:00', reward: 'Heart Healthy Badge' }
      ])
    },
    {
      name: 'Gastritis',
      description: 'Moderate hydration to soothe the stomach lining and aid digestion.',
      recommendedIntake: '2.0',
      notes: 'Consult a gastroenterologist if symptoms like burning pain persist.',
      schedule: JSON.stringify({ intervals: 8, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Drink room-temperature water to avoid stomach irritation.',
        'Avoid acidic drinks like citrus juices.',
        'Pair hydration with antacids if prescribed.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.4, time: '12:00', reward: '40% Milestone' },
        { goal: 0.7, time: '18:00', reward: '70% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Stomach Soother Badge' }
      ])
    },
    {
      name: 'Hypertension',
      description: 'Adequate hydration to help regulate blood pressure and support circulation.',
      recommendedIntake: '2.5',
      notes: 'Monitor blood pressure regularly and consult your doctor.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Combine with a low-sodium diet to enhance blood pressure control.',
        'Use filtered water to avoid excess minerals.',
        'Hydrate consistently to stabilize blood pressure.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.8, time: '18:00', reward: '80% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Pressure Balancer Badge' }
      ])
    },
    {
      name: 'Diabetes',
      description: 'Increased hydration to manage blood sugar levels and prevent dehydration.',
      recommendedIntake: '2.5',
      notes: 'Consult your endocrinologist for hydration needs during hyperglycemia.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Monitor blood sugar; increase intake if glucose is high.',
        'Prefer water over sugary drinks to avoid spikes.',
        'Carry a water bottle to maintain consistency.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.75, time: '18:00', reward: '75% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Sugar Stabilizer Badge' }
      ])
    },
    {
      name: 'Urinary Tract Infections',
      description: 'High water intake to flush bacteria from the urinary tract.',
      recommendedIntake: '3.0',
      notes: 'Seek medical advice if symptoms persist beyond 48 hours.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.3, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Drink cranberry-infused water (unsweetened) to support urinary health.',
        'Hydrate frequently to promote urination.',
        'Avoid caffeine, which can irritate the bladder.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.8, time: '18:00', reward: '80% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'UTI Fighter Badge' }
      ])
    },
    {
      name: 'Kidney Stones',
      description: 'High hydration to prevent stone formation and promote urine output.',
      recommendedIntake: '3.5',
      notes: 'Consult a urologist for dietary restrictions and stone type.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.35, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Aim for clear urine as a sign of adequate hydration.',
        'Include lemon water to reduce stone formation (consult doctor).',
        'Use a large-capacity bottle to track intake.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.8, time: '18:00', reward: '80% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Stone Crusher Badge' }
      ])
    },
    {
      name: 'Liver Disease',
      description: 'Moderate hydration to support detoxification and liver function.',
      recommendedIntake: '2.0',
      notes: 'Monitor for ascites and consult your hepatologist.',
      schedule: JSON.stringify({ intervals: 8, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Use filtered water to reduce liver workload.',
        'Coordinate with meals to aid digestion.',
        'Avoid alcohol-based fluids completely.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.4, time: '12:00', reward: '40% Milestone' },
        { goal: 0.7, time: '18:00', reward: '70% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Liver Supporter Badge' }
      ])
    },
    {
      name: 'Asthma',
      description: 'Adequate hydration to keep airways moist and reduce mucus viscosity.',
      recommendedIntake: '2.5',
      notes: 'Use prescribed inhalers and consult your pulmonologist.',
      schedule: JSON.stringify({ intervals: 10, amountPerInterval: 0.25, startTimeField: 'wakeUpTime', endTimeField: 'bedtime' }),
      tips: JSON.stringify([
        'Drink warm water to soothe airways.',
        'Use a humidifier alongside hydration to reduce mucus.',
        'Avoid cold drinks that may trigger symptoms.'
      ]),
      milestones: JSON.stringify([
        { goal: 0.5, time: '12:00', reward: '50% Milestone' },
        { goal: 0.75, time: '18:00', reward: '75% Milestone' },
        { goal: 1.0, time: 'bedtime', reward: 'Breath Easy Badge' }
      ])
    }
  ];

  for (const plan of plans) {
    await databases.createDocument(
      '66fad9b2001d11a7fe7c',
      '681fb4b50015386144ab',
      ID.unique(),
      plan
    );
    console.log(`Created plan: ${plan.name}`);
  }
};

createPlans().catch(console.error);