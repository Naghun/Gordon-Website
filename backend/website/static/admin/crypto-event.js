document.addEventListener('DOMContentLoaded', () => {
  const renameAddImage = () => {
    document.querySelectorAll('.inline-group .add-row a').forEach((link) => {
      if (link.textContent.trim() !== 'Dodaj još jednu sliku') {
        link.textContent = 'Dodaj još jednu sliku';
      }
    });
  };

  renameAddImage();
  new MutationObserver(renameAddImage).observe(document.body, {
    childList: true,
    subtree: true,
  });

  const installFullTimeList = () => {
    document.querySelectorAll('button[id^="clocklink"]').forEach((button) => {
      if (button.dataset.fullHoursReady) return;
      button.dataset.fullHoursReady = 'true';
      button.addEventListener('click', () => {
        window.setTimeout(() => {
          const index = Number(button.id.replace('clocklink', ''));
          const clock = document.getElementById(`clockbox${index}`);
          const input = document.querySelectorAll('input.vTimeField')[index];
          const list = clock?.querySelector('.timelist');
          if (!list || !input) return;
          list.replaceChildren();
          Array.from({ length: 24 }, (_, hour) => hour).forEach((hour) => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = `${String(hour).padStart(2, '0')}:00`;
            link.addEventListener('click', (event) => {
              event.preventDefault();
              input.value = `${String(hour).padStart(2, '0')}:00:00`;
              input.dispatchEvent(new Event('change', { bubbles: true }));
              clock.close();
            });
            item.appendChild(link);
            list.appendChild(item);
          });
        }, 0);
      });
    });
  };

  installFullTimeList();
  new MutationObserver(installFullTimeList).observe(document.body, {
    childList: true,
    subtree: true,
  });

  const closePickerOnBackdrop = (event) => {
    const picker = event.target.closest?.('dialog.calendarbox, dialog.clockbox');
    if (picker && event.target === picker) picker.close();
  };
  document.addEventListener('click', closePickerOnBackdrop);
});
