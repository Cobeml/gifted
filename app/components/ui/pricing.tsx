export function Pricing() {
  const plans = [
    {
      name: 'Single Gift',
      price: '49',
      description: 'Perfect for one-time gifting',
      features: [
        'One premium gift',
        'AI-powered suggestions',
        'Expert curation',
        'Premium gift wrapping',
        'Delivery included'
      ]
    },
    {
      name: 'Quarterly Plan',
      price: '129',
      description: 'Best for regular gift-givers',
      features: [
        'Three premium gifts per quarter',
        'Priority AI suggestions',
        'Expert curation',
        'Premium gift wrapping',
        'Free priority shipping',
        'Gift scheduling'
      ],
      popular: true
    },
    {
      name: 'Monthly Plan',
      price: '199',
      description: 'For frequent gifters',
      features: [
        'Monthly premium gift',
        'Advanced AI suggestions',
        'Dedicated gift curator',
        'Premium gift wrapping',
        'Free priority shipping',
        'Gift scheduling',
        'Recipient profiles'
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find the perfect gifting plan for your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-sm">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  {plan.name !== 'Single Gift' && <span className="text-gray-600 dark:text-gray-300">/month</span>}
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        className="w-5 h-5 text-indigo-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 