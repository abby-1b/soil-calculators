
export class Printing {
  private content: DocumentElement[] = [];
  private currentStyle: TextStyle = {};
  private documentTitle: string = 'Document';

  public text(content: string): Printing {
    this.content.push({
      type: 'text',
      content,
      style: { ...this.currentStyle }
    });
    return this;
  }

  public header1(content: string): Printing {
    this.content.push({
      type: 'header1',
      content,
      style: { ...this.currentStyle }
    });
    return this;
  }

  public header2(content: string): Printing {
    this.content.push({
      type: 'header2',
      content,
      style: { ...this.currentStyle }
    });
    return this;
  }

  public table(data: any[][], options?: TableOptions): Printing {
    this.content.push({
      type: 'table',
      data,
      options: options || {},
      style: { ...this.currentStyle }
    });
    return this;
  }

  public image(src: string, options?: ImageOptions): Printing {
    this.content.push({
      type: 'image',
      src,
      options: options || {},
      style: { ...this.currentStyle }
    });
    return this;
  }

  public style(style: TextStyle): Printing {
    this.currentStyle = { ...this.currentStyle, ...style };
    return this;
  }

  public resetStyle(): Printing {
    this.currentStyle = {};
    return this;
  }

  public setTitle(title: string): Printing {
    this.documentTitle = title;
    return this;
  }

  public print(): void {
    const htmlContent = this.generateHTML();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this site to print.');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for images to load before printing
    const images = printWindow.document.images;
    let imagesLoaded = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      this.triggerPrint(printWindow);
      return;
    }

    for (let i = 0; i < totalImages; i++) {
      images[i].onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          this.triggerPrint(printWindow);
        }
      };
      // Also handle errors to prevent waiting forever
      images[i].onerror = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          this.triggerPrint(printWindow);
        }
      };
    }

    // Fallback: print after 3 seconds even if images aren't loaded
    setTimeout(() => {
      this.triggerPrint(printWindow);
    }, 3000);
  }

  private triggerPrint(printWindow: Window): void {
    printWindow.focus();
    printWindow.print();
    
    // Optional: close window after print (commented out for user convenience)
    // printWindow.onafterprint = () => {
    //   printWindow.close();
    // };
  }

  private generateHTML(): string {
    const elementsHTML = this.content.map(element => this.renderElement(element)).join('\n');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${this.escapeHTML(this.documentTitle)}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
        }
        .header1 {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }
        .header2 {
            font-size: 20px;
            font-weight: bold;
            margin: 15px 0 8px 0;
            color: #34495e;
        }
        .text {
            margin: 8px 0;
            text-align: left;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            page-break-inside: avoid;
        }
        .table th {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
            text-align: left;
            font-weight: bold;
        }
        .table td {
            border: 1px solid #dee2e6;
            padding: 8px 12px;
        }
        .image {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            page-break-inside: avoid;
        }
        .image-center {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .image-left {
            float: left;
            margin-right: 15px;
        }
        .image-right {
            float: right;
            margin-left: 15px;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
        @media print {
            body {
                padding: 10px;
            }
            .header1 {
                page-break-after: avoid;
            }
            .header2 {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    ${elementsHTML}
</body>
</html>`;
  }

  private renderElement(element: DocumentElement): string {
    const style = this.buildStyleString(element.style);
    
    switch (element.type) {
      case 'text':
        return `<div class="text" style="${style}">${this.escapeHTML(element.content)}</div>`;
      
      case 'header1':
        return `<h1 class="header1" style="${style}">${this.escapeHTML(element.content)}</h1>`;
      
      case 'header2':
        return `<h2 class="header2" style="${style}">${this.escapeHTML(element.content)}</h2>`;
      
      case 'table':
        return this.renderTable(element);
      
      case 'image':
        return this.renderImage(element);
      
      default:
        return '';
    }
  }

  private renderTable(element: TableElement): string {
    const style = this.buildStyleString(element.style);
    const hasHeaders = element.options.headers ?? true;
    
    let tableHTML = `<table class="table" style="${style}">\n`;
    
    if (hasHeaders && element.data.length > 0) {
      tableHTML += '<thead><tr>\n';
      element.data[0].forEach(cell => {
        tableHTML += `  <th>${this.escapeHTML(String(cell))}</th>\n`;
      });
      tableHTML += '</tr></thead>\n';
    }
    
    tableHTML += '<tbody>\n';
    const startRow = hasHeaders ? 1 : 0;
    
    for (let i = startRow; i < element.data.length; i++) {
      tableHTML += '<tr>\n';
      element.data[i].forEach(cell => {
        tableHTML += `  <td>${this.escapeHTML(String(cell))}</td>\n`;
      });
      tableHTML += '</tr>\n';
    }
    
    tableHTML += '</tbody>\n</table>';
    return tableHTML;
  }

  private renderImage(element: ImageElement): string {
    const style = this.buildStyleString(element.style);
    const alignment = element.options.alignment || 'left';
    const width = element.options.width ? `width="${element.options.width}"` : '';
    const height = element.options.height ? `height="${element.options.height}"` : '';
    
    const alignmentClass = `image-${alignment}`;
    const containerClass = alignment !== 'center' ? 'clearfix' : '';
    
    return `
<div class="${containerClass}">
    <img src="${element.src}" 
         class="image ${alignmentClass}" 
         style="${style}" 
         ${width} 
         ${height}
         alt="${this.escapeHTML(element.options.alt || 'Image')}">
</div>`;
  }

  private buildStyleString(style: TextStyle): string {
    const styleParts: string[] = [];
    
    if (style.fontSize) styleParts.push(`font-size: ${style.fontSize}px`);
    if (style.fontFamily) styleParts.push(`font-family: ${style.fontFamily}`);
    if (style.color) styleParts.push(`color: ${style.color}`);
    if (style.bold) styleParts.push('font-weight: bold');
    if (style.italic) styleParts.push('font-style: italic');
    if (style.alignment) styleParts.push(`text-align: ${style.alignment}`);
    if (style.lineHeight) styleParts.push(`line-height: ${style.lineHeight}`);
    
    return styleParts.join('; ');
  }

  private escapeHTML(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  public clear(): Printing {
    this.content = [];
    this.currentStyle = {};
    this.documentTitle = 'Document';
    return this;
  }

  public preview(): void {
    const htmlContent = this.generateHTML();
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    }
  }
}

// Type definitions (same as before)
type DocumentElement = TextElement | Header1Element | Header2Element | TableElement | ImageElement;

interface BaseElement {
  type: string;
  style: TextStyle;
}

interface TextElement extends BaseElement {
  type: 'text';
  content: string;
}

interface Header1Element extends BaseElement {
  type: 'header1';
  content: string;
}

interface Header2Element extends BaseElement {
  type: 'header2';
  content: string;
}

interface TableElement extends BaseElement {
  type: 'table';
  data: any[][];
  options: TableOptions;
}

interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  options: ImageOptions;
}

interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
}

interface TableOptions {
  headers?: boolean;
  columnWidths?: number[];
  borderWidth?: number;
  borderColor?: string;
  headerBackground?: string;
  cellPadding?: number;
}

interface ImageOptions {
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  maxWidth?: number;
  maxHeight?: number;
  alt?: string;
}
