import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import type { Recipe } from '../types/recipe';

/**
 * Generates and triggers download of a styled Microsoft Word (.docx) document
 * for the selected recipe.
 */
export async function exportRecipeToDocx(recipe: Recipe): Promise<void> {
  const tableBorderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  // Group ingredients by section if present
  const ingredientRows: TableRow[] = [];
  
  // Header row
  ingredientRows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: 'Ilość', bold: true, color: '78350F' })] })],
          borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'D97706' }, top: tableBorderNone.top, left: tableBorderNone.left, right: tableBorderNone.right },
        }),
        new TableCell({
          width: { size: 6000, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: 'Składnik', bold: true, color: '78350F' })] })],
          borders: { bottom: { style: BorderStyle.SINGLE, size: 8, color: 'D97706' }, top: tableBorderNone.top, left: tableBorderNone.left, right: tableBorderNone.right },
        }),
      ],
    })
  );

  let currentSection = '';
  recipe.ingredients.forEach((ing) => {
    if (ing.section && ing.section !== currentSection) {
      currentSection = ing.section;
      ingredientRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [
                new Paragraph({
                  spacing: { before: 120, after: 60 },
                  children: [new TextRun({ text: `• ${currentSection}`, bold: true, italics: true, color: '92400E' })],
                }),
              ],
              borders: tableBorderNone,
            }),
          ],
        })
      );
    }

    ingredientRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${ing.amount ? `${ing.amount} ` : ''}${ing.unit || ''}`.trim() || '—',
                    bold: true,
                    color: '44403C',
                  }),
                ],
              }),
            ],
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E7E5E4' },
              top: tableBorderNone.top,
              left: tableBorderNone.left,
              right: tableBorderNone.right,
            },
          }),
          new TableCell({
            width: { size: 6000, type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: ing.name,
                    color: '1C1917',
                  }),
                ],
              }),
            ],
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E7E5E4' },
              top: tableBorderNone.top,
              left: tableBorderNone.left,
              right: tableBorderNone.right,
            },
          }),
        ],
      })
    );
  });

  // Step paragraphs
  const stepParagraphs = recipe.steps.map((step, idx) => {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: `Krok ${idx + 1}`,
            bold: true,
            color: 'B45309',
            size: 24, // 12pt
          }),
          ...(step.timerMinutes
            ? [
                new TextRun({
                  text: ` (⏱ ${step.timerMinutes} min)`,
                  italics: true,
                  color: '78716C',
                  size: 20,
                }),
              ]
            : []),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: step.instruction,
            color: '1C1917',
            size: 22, // 11pt
          }),
        ],
      }),
      ...(step.tip
        ? [
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `💡 Wskazówka: ${step.tip}`,
                  italics: true,
                  color: '92400E',
                  size: 20,
                }),
              ],
            }),
          ]
        : []),
    ];
  }).flat();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: recipe.title,
                bold: true,
                size: 38, // 19pt
                color: '78350F',
                font: 'Georgia',
              }),
            ],
          }),

          // Description
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 260 },
            children: [
              new TextRun({
                text: recipe.description || 'Przepis kulinarny',
                italics: true,
                size: 22,
                color: '57534E',
              }),
            ],
          }),

          // Metadata line
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: 'Porcje: ', bold: true, color: '78716C' }),
              new TextRun({ text: `${recipe.servings}  |  `, color: '1C1917' }),
              new TextRun({ text: 'Przygotowanie: ', bold: true, color: '78716C' }),
              new TextRun({ text: `${recipe.prepTimeMinutes} min  |  `, color: '1C1917' }),
              new TextRun({ text: 'Gotowanie/Pieczenie: ', bold: true, color: '78716C' }),
              new TextRun({ text: `${recipe.cookTimeMinutes} min  |  `, color: '1C1917' }),
              new TextRun({ text: 'Trudność: ', bold: true, color: '78716C' }),
              new TextRun({ text: `${recipe.difficulty}  |  `, color: '1C1917' }),
              new TextRun({ text: 'Grupy: ', bold: true, color: '78716C' }),
              new TextRun({ text: `${recipe.groups.join(', ') || 'Ogólne'}`, color: 'B45309' }),
            ],
          }),

          // Ingredients header
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 140 },
            children: [
              new TextRun({
                text: 'Składniki',
                bold: true,
                size: 28, // 14pt
                color: '92400E',
              }),
            ],
          }),

          // Ingredients table
          new Table({
            rows: ingredientRows,
            width: { size: 9000, type: WidthType.DXA },
          }),

          // Instructions header
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 140 },
            children: [
              new TextRun({
                text: 'Sposób przygotowania',
                bold: true,
                size: 28, // 14pt
                color: '92400E',
              }),
            ],
          }),

          // Instructions list
          ...stepParagraphs,

          // Notes if present
          ...(recipe.notes
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 280, after: 100 },
                  children: [
                    new TextRun({
                      text: 'Notatki kucharza',
                      bold: true,
                      size: 26,
                      color: '92400E',
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: recipe.notes,
                      italics: true,
                      color: '44403C',
                    }),
                  ],
                }),
              ]
            : []),

          // Footer
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: 'Wygenerowano z aplikacji Książka Przepisów & Lista Zakupów',
                italics: true,
                size: 16,
                color: 'A8A29E',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const sanitizedTitle = recipe.title.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'przepis';
  downloadBlob(blob, `${sanitizedTitle}.docx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
