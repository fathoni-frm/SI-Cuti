export function formatGMT8(date, options = {}) {
  // Set default options
  const {
    showTime = true,
    showSeconds = false,
    dateSeparator = ' ',
    timeSeparator = ':'
  } = options;

  // Pastikan input adalah Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Opsi untuk format tanggal
  const dateOptions = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  };

  // Opsi untuk format waktu
  const timeOptions = {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  if (showSeconds) {
    timeOptions.second = '2-digit';
  }

  // Format bagian tanggal
  const dateFormatter = new Intl.DateTimeFormat('id-ID', dateOptions);
  const dateParts = dateFormatter.formatToParts(dateObj);

  const year = dateParts.find(p => p.type === 'year').value;
  const month = dateParts.find(p => p.type === 'month').value;
  const day = dateParts.find(p => p.type === 'day').value;

  const formattedDate = [day, month, year].join(dateSeparator);

  // Jika hanya ingin tanggal
  if (!showTime) {
    return formattedDate;
  }

  // Format bagian waktu
  const timeFormatter = new Intl.DateTimeFormat('id-ID', timeOptions);
  const timeParts = timeFormatter.formatToParts(dateObj);

  const hour = timeParts.find(p => p.type === 'hour').value;
  const minute = timeParts.find(p => p.type === 'minute').value;

  let formattedTime = [hour, minute].join(timeSeparator);

  if (showSeconds) {
    const second = timeParts.find(p => p.type === 'second').value;
    formattedTime += timeSeparator + second;
  }

  return `${formattedDate} ${formattedTime}`;
}

export function formatDateWithoutTimezone(date) {
  if (!date) return '';

  const d = new Date(date);

  // Handle invalid date
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date input');
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}