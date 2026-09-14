// Shared by the rendered site and the crawler-visible HTML generator.
export const business = {
  name: 'Gordon Digital Marketing',
  brand: 'GordonDM',
  url: 'https://gordon.ba/',
  email: 'kontakt@gordondm.com',
  phone: '+38761264263',
  phoneDisplay: '061 264 263',
  street: 'Džemala Bijedića 279K',
  city: 'Sarajevo',
  postalCode: '71000',
  country: 'Bosna i Hercegovina',
  hours: 'Ponedjeljak – petak, 09:00 – 17:00',
};
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.street}, ${business.postalCode} ${business.city}, ${business.country}`)}`;
export function publicImageUrl(value) {
  if (!value) return `${business.url}blog/web3-featured-v1.png`;
  // Database ImageField exports contain storage names, while the API returns URLs.
  const path = /^(https?:\/\/|\/)/.test(value) ? value : `/backend/media/${value}`;
  const url = new URL(path, business.url);
  if (url.pathname.startsWith('/media/')) return `${business.url}backend${url.pathname}`;
  if (['localhost','127.0.0.1'].includes(url.hostname)) return new URL(url.pathname, business.url).href;
  return url.href;
}
export function businessSchema() {
  return {
    '@type': 'LocalBusiness', '@id': `${business.url}#organization`,
    name: business.name, alternateName: business.brand, url: business.url,
    logo: `${business.url}logo-gordondm-dark.png`,
    image: `${business.url}logo-gordondm-dark.png`,
    email: business.email, telephone: business.phone,
    address: { '@type': 'PostalAddress', streetAddress: business.street,
      addressLocality: business.city, postalCode: business.postalCode, addressCountry: 'BA' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '17:00' }],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service',
      telephone: business.phone, email: business.email },
    areaServed: ['Sarajevo','Bosna i Hercegovina','Balkan'],
  };
}
