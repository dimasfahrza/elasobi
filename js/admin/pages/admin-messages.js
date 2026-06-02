import { supabase } from '../../supabase.js';
import { showAdminToast } from '../admin-app.js';

export const renderAdminMessages = async (root) => {
  root.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>Contact Messages</h1>
        <p>Messages submitted by visitors through the contact form</p>
      </div>
    </div>
    <div class="admin-card">
      <div class="admin-card-header">
        <h2><i class="fas fa-envelope"></i> Inbox</h2>
        <div style="display:flex;gap:8px;align-items:center;">
          <label style="font-size:13px;color:var(--admin-muted);">Filter:</label>
          <select id="msg-filter" class="admin-select-sm">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>
      <div id="messages-list"><div class="admin-loader"></div></div>
    </div>

    <!-- Detail modal -->
    <div id="msg-modal" class="admin-modal-overlay" hidden>
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h3 id="modal-subject">Message</h3>
          <button class="admin-modal-close" id="modal-close"><i class="fas fa-times"></i></button>
        </div>
        <div id="modal-body" class="admin-modal-body"></div>
      </div>
    </div>`;

  let allMessages = [];

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      root.querySelector('#messages-list').innerHTML =
        `<div class="admin-empty">Failed to load messages: ${error.message}</div>`;
      return;
    }
    allMessages = data || [];
    renderList();
  };

  const renderList = () => {
    const filter = root.querySelector('#msg-filter').value;
    const msgs = allMessages.filter(m => {
      if (filter === 'unread') return !m.is_read;
      if (filter === 'read')   return m.is_read;
      return true;
    });

    const listEl = root.querySelector('#messages-list');

    if (msgs.length === 0) {
      listEl.innerHTML = `<div class="admin-empty">No messages found</div>`;
      return;
    }

    listEl.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${msgs.map(m => `
              <tr class="${m.is_read ? '' : 'msg-unread'}" data-id="${m.id}">
                <td><i class="fas fa-${m.is_read ? 'envelope-open' : 'envelope'}" style="color:${m.is_read ? 'var(--admin-muted)' : 'var(--admin-primary)'}"></i></td>
                <td><strong>${escHtml(m.name)}</strong></td>
                <td>${escHtml(m.email)}</td>
                <td>${escHtml(m.subject || '—')}</td>
                <td>${new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <button class="admin-btn admin-btn-secondary admin-btn-sm view-btn" data-id="${m.id}">View</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

    listEl.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(Number(btn.dataset.id)));
    });
  };

  const openModal = async (id) => {
    const msg = allMessages.find(m => m.id === id);
    if (!msg) return;

    root.querySelector('#modal-subject').textContent = msg.subject || 'No Subject';
    root.querySelector('#modal-body').innerHTML = `
      <div class="msg-meta">
        <div><strong>From:</strong> ${escHtml(msg.name)} &lt;${escHtml(msg.email)}&gt;</div>
        <div><strong>Date:</strong> ${new Date(msg.created_at).toLocaleString()}</div>
        <div style="margin-top:4px;"><span class="badge-status ${msg.is_read ? 'delivered' : 'pending'}">${msg.is_read ? 'Read' : 'Unread'}</span></div>
      </div>
      <div class="msg-body">${escHtml(msg.message).replace(/\n/g, '<br>')}</div>
      ${!msg.is_read ? `<button class="admin-btn" id="mark-read-btn">Mark as Read</button>` : ''}`;

    root.querySelector('#msg-modal').hidden = false;

    if (!msg.is_read) {
      root.querySelector('#mark-read-btn')?.addEventListener('click', async () => {
        const { error } = await supabase
          .from('contact_messages')
          .update({ is_read: true })
          .eq('id', id);

        if (error) { showAdminToast('Failed to update message.', 'error'); return; }

        msg.is_read = true;
        showAdminToast('Marked as read.', 'success');
        root.querySelector('#msg-modal').hidden = true;
        renderList();
      });
    }
  };

  root.querySelector('#modal-close').addEventListener('click', () => {
    root.querySelector('#msg-modal').hidden = true;
  });
  root.querySelector('#msg-modal').addEventListener('click', (e) => {
    if (e.target === root.querySelector('#msg-modal')) root.querySelector('#msg-modal').hidden = true;
  });

  root.querySelector('#msg-filter').addEventListener('change', renderList);

  await loadMessages();
};

const escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
