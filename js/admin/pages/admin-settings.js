import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

export const renderAdminSettings = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Settings</h1>
        <p>Manage special offer timer and store settings</p>
      </div>
    </div>

    <div class="admin-card" style="max-width:520px;">
      <div class="admin-card-header">
        <h3 style="font-size:16px;font-weight:600;">Special Offer Timer</h3>
      </div>
      <div style="padding:24px;">
        <div class="admin-form-group" style="margin-bottom:20px;">
          <label style="display:block;margin-bottom:8px;font-weight:500;font-size:14px;">
            Offer End Date &amp; Time
          </label>
          <input type="datetime-local" id="offer-end-input" class="admin-input" style="width:100%;" />
          <p style="font-size:12px;color:var(--admin-text-muted);margin-top:6px;">
            The countdown on the homepage will count down to this date.
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <button class="admin-btn" id="save-offer-btn">
            <i class="fas fa-save"></i> Save
          </button>
          <span id="last-updated" style="font-size:12px;color:var(--admin-text-muted);"></span>
        </div>
      </div>
    </div>
  `;

  // Load current value
  const { data } = await supabase
    .from('settings')
    .select('value, updated_at')
    .eq('key', 'offer_end_date')
    .single();

  const input = root.querySelector('#offer-end-input');
  const lastUpdated = root.querySelector('#last-updated');

  if (data?.value) {
    // datetime-local input needs format: YYYY-MM-DDTHH:mm
    const d = new Date(data.value);
    input.value = d.toISOString().slice(0, 16);
    lastUpdated.textContent = `Last saved: ${d.toLocaleString()}`;
  }

  root.querySelector('#save-offer-btn').addEventListener('click', async () => {
    const btn = root.querySelector('#save-offer-btn');
    const val = input.value;
    if (!val) {
      showAdminToast('Please select a date and time.', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

    const isoValue = new Date(val).toISOString();

    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'offer_end_date', value: isoValue, updated_at: new Date().toISOString() });

    if (error) {
      showAdminToast(`Error: ${error.message}`, 'error');
    } else {
      showAdminToast('Offer timer updated!', 'success');
      lastUpdated.textContent = `Last saved: ${new Date(isoValue).toLocaleString()}`;
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save';
  });
};
