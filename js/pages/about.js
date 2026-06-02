import { supabase } from '../supabase.js';
import { showToast } from '../app.js';

export const renderAbout = (root) => {
  root.innerHTML = `
    <section class="page-banner"><h1>About Us</h1></section>
    <section class="container about-page">
      <h1>About Elasobi</h1>
      <p>At <strong>Elasobi</strong>, we specialize in selling authentic Apple Products. We believe in quality, authenticity, and providing our customers with the best shopping experience possible.</p>
      <p>Founded with a passion for technology, we are committed to bringing you the latest Apple products at competitive prices, with fast and reliable delivery across Taiwan and beyond.</p>
      <p>Our team is dedicated to customer satisfaction, offering 24/7 online support, free shipping on all orders, and a 7-day money-back guarantee on all purchases.</p>
      <h2 style="margin-top:32px;">Why choose us?</h2>
      <ul style="padding-left:24px;line-height:2;">
        <li>100% Authentic Apple Products</li>
        <li>Free Delivery on all orders</li>
        <li>24/7 Customer Support</li>
        <li>7-day Money-back Guarantee</li>
        <li>Secure Online Payments</li>
      </ul>
    </section>

    <section class="contact-section" id="contact-section">
      <div class="container">
        <div class="contact-heading">
          <h2>Get In Touch</h2>
          <p>Have a question or need help? Fill out the form and we'll get back to you as soon as possible.</p>
        </div>
        <div class="contact-card">

          <!-- Left: info panel -->
          <div class="contact-info-panel">
            <h3>Contact Information</h3>
            <p class="contact-info-sub">Reach us through any of these channels</p>
            <ul class="contact-info-list">
              <li>
                <span class="contact-info-icon"><i class="fas fa-phone-alt"></i></span>
                <div>
                  <strong>Phone</strong>
                  <span>+886 987 123 213</span>
                </div>
              </li>
              <li>
                <span class="contact-info-icon"><i class="fas fa-envelope"></i></span>
                <div>
                  <strong>Email</strong>
                  <span>elasobi@example.com</span>
                </div>
              </li>
              <li>
                <span class="contact-info-icon"><i class="far fa-clock"></i></span>
                <div>
                  <strong>Business Hours</strong>
                  <span>Mon – Sat &nbsp;9 AM – 6 PM</span>
                  <span style="font-size:12px;opacity:.75;">Closed on Sunday</span>
                </div>
              </li>
              <li>
                <span class="contact-info-icon"><i class="fas fa-map-marker-alt"></i></span>
                <div>
                  <strong>Location</strong>
                  <span>Elasobi HQ, Taiwan</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- Right: form panel -->
          <div class="contact-form-panel">
            <div id="contact-error" class="auth-error" hidden></div>
            <form id="contact-form" novalidate>
              <div class="contact-form-row">
                <div class="contact-field">
                  <label>Full Name <span class="req">*</span></label>
                  <div class="input-icon-wrap">
                    <i class="fas fa-user"></i>
                    <input type="text" name="name" placeholder="John Doe" required />
                  </div>
                </div>
                <div class="contact-field">
                  <label>Email Address <span class="req">*</span></label>
                  <div class="input-icon-wrap">
                    <i class="fas fa-envelope"></i>
                    <input type="email" name="email" placeholder="you@example.com" required />
                  </div>
                </div>
              </div>
              <div class="contact-field">
                <label>Subject</label>
                <div class="input-icon-wrap">
                  <i class="fas fa-tag"></i>
                  <input type="text" name="subject" placeholder="How can we help?" />
                </div>
              </div>
              <div class="contact-field">
                <label>Message <span class="req">*</span></label>
                <textarea name="message" rows="5" placeholder="Write your message here..." required></textarea>
              </div>
              <button type="submit" class="contact-submit-btn" id="contact-btn">
                <i class="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>`;

  const form  = root.querySelector('#contact-form');
  const btn   = root.querySelector('#contact-btn');
  const errEl = root.querySelector('#contact-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd      = new FormData(form);
    const name    = fd.get('name')?.trim();
    const email   = fd.get('email')?.trim();
    const subject = fd.get('subject')?.trim();
    const message = fd.get('message')?.trim();

    errEl.hidden = true;

    if (!name || !email || !message) {
      errEl.textContent = 'Please fill in all required fields.';
      errEl.hidden = false;
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    const { error } = await supabase
      .from('contact_messages')
      .insert({ name, email, subject: subject || null, message });

    if (error) {
      errEl.textContent = 'Failed to send message. Please try again.';
      errEl.hidden = false;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      return;
    }

    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    showToast("Message sent! We'll get back to you soon.", 'success');
  });
};
