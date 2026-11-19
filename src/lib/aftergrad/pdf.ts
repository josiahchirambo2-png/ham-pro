export async function downloadReport(title: string, filename: string, sections: { title: string; lines: string[] }[]) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  let y = 24;
  const clean = (text: string) => text.replace(/[—–]/g, "-").replace(/[‘’]/g, "'").replace(/[^\x20-\x7E\n]/g, " ");
  function write(text: string, size: number, bold = false) {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(clean(text), 172) as string[]) {
      if (y > 273) { pdf.addPage(); y = 24; }
      pdf.text(line, 19, y);
      y += size > 15 ? 10 : 6;
    }
  }
  write("KIT AI  /  AFTER GRADUATION", 10, true);
  y += 6;
  write(title, 23, true);
  y += 4;
  for (const section of sections) {
    if (y > 258) { pdf.addPage(); y = 24; }
    write(section.title, 13, true);
    for (const line of section.lines) write(line, 10);
    y += 6;
  }
  pdf.save(filename);
}
