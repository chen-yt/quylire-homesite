import { buildInquiry } from './inquiry.js';

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('is-open', !isOpen);
});

nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const form = document.querySelector('#contact-form');
const topic = document.querySelector('#topic');
const draftStatus = document.querySelector('#draft-status');
let preparedInquiry = '';

document.querySelectorAll('[data-topic]').forEach((link) => {
  link.addEventListener('click', () => {
    topic.value = link.dataset.topic;
    draftStatus.hidden = true;
  });
});

form.addEventListener('input', () => {
  draftStatus.hidden = true;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  if (!data.name.trim() || !data.message.trim()) {
    const invalid = !data.name.trim() ? form.elements.name : form.elements.message;
    invalid.setCustomValidity('Please enter more than spaces.');
    invalid.reportValidity();
    invalid.addEventListener('input', () => invalid.setCustomValidity(''), { once: true });
    return;
  }
  const inquiry = buildInquiry(data);
  preparedInquiry = inquiry.text;
  document.querySelector('#draft-link').href = inquiry.href;
  document.querySelector('#inquiry-copy-status').textContent = '';
  draftStatus.hidden = false;
  // Keep the website and copy fallback available if the device blocks mailto links.
  document.querySelector('#draft-link').click();
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch { /* Try the local fallback when clipboard permission is unavailable. */ }
  }
  const input = document.createElement('textarea');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Clipboard unavailable');
}

document.querySelector('.copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await copyText('contact@quylire.com');
    status.textContent = 'Email copied.';
  } catch {
    status.textContent = 'Please select and copy the email address above.';
  }
});

document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const status = document.querySelector('#inquiry-copy-status');
  try {
    await copyText(preparedInquiry);
    status.textContent = 'Inquiry copied. Paste it into an email to contact@quylire.com.';
  } catch {
    status.textContent = 'Copy is unavailable. Please email contact@quylire.com directly.';
  }
});

const dialog = document.querySelector('#privacy-dialog');
document.querySelector('#privacy-open').addEventListener('click', () => dialog.showModal());
document.querySelector('#privacy-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
// Prevent native GET submission if JavaScript is disabled or initialization fails.
document.querySelector('#inquiry-fields').disabled = false;
