import catalog from './services.json' with { type: 'json' };

export const services = catalog;
export const categories = { marketing: 'Marketing', 'softver-rjesenja': 'Softver rješenja' };
export const findService = path => services.find(service => service.path.replace(/\/$/, '') === path.replace(/\/$/, ''));
export const serviceSections = service => [
  ['Šta dobijate', service.deliverables.join(' · ')],
  ...service.sections.flatMap(section => section.paragraphs.map(text => [section.heading, text])),
  ...service.faqs.map(faq => [faq.question, faq.answer]),
];
export function serviceGraph(service) {
  const url = `https://gordon.ba${service.path}`;
  return [
    { '@type': 'Service', '@id': `${url}#service`, name: service.title,
      description: service.summary, url, serviceType: service.title,
      provider: { '@id': 'https://gordon.ba/#organization' },
      mainEntityOfPage: { '@id': `${url}#webpage` }, areaServed: { '@type': 'Country', name: 'Bosna i Hercegovina' } },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumbs`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://gordon.ba/' },
      { '@type': 'ListItem', position: 2, name: categories[service.category], item: `https://gordon.ba/${service.category}` },
      { '@type': 'ListItem', position: 3, name: service.title, item: url },
    ] },
  ];
}
