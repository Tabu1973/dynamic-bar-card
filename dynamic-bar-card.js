const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// Hilfsfunktion zum Feuern von Events für den Editor
function fireEvent(node, type, detail, options) {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
}

const translations = {
  en: {
    title_example: "Pollen Count (Example)",
    unknown: "Unknown",
    entity: "Entity",
    title_optional: "Title (optional)",
    global_design: "Global Design Settings",
    orientation: "Orientation (Horizontal / Vertical)",
    horizontal_default: "Horizontal (Default)",
    vertical: "Vertical",
    vertical_height: "Height of vertical bars (px)",
    layout_position: "Layout (Icon/Name Position)",
    above_bar: "Above the bar",
    inline_bar: "Before the bar (Inline)",
    spacing: "Spacing (Icon/Name to bar)",
    spacing_placeholder: "e.g. 30% or 150px",
    value_position: "Value Position",
    below_name: "Below the name (Outside)",
    next_to_name: "Next to the name (Outside)",
    left_of_bar: "Left of the bar",
    right_of_bar: "Right of the bar",
    above_bar_right: "Directly above the bar (Right-aligned)",
    inside_bar: "Integrated in the bar",
    text_alignment_inside: "Text alignment (only when 'Integrated')",
    dynamic: "Adapted to value (Dynamic)",
    bottom: "Bottom",
    center: "Center",
    top: "Top",
    left: "Left",
    right: "Right",
    value_alignment_outside: "Value Alignment (Outside)",
    bars_entities: "Bars (Entities)",
    copy_settings: "Copy settings from previous entity",
    delete_entity: "Delete entity",
    name_optional: "Name (optional)",
    icon_optional: "Icon (optional, e.g. mdi:tree)",
    icon_color: "Icon Color",
    default_theme: "Default (Theme)",
    dynamic_color: "Dynamic (same as bar)",
    static_color: "Static (Fixed Color)",
    min_value: "Min Value",
    max_value: "Max Value",
    bar_thickness: "Bar thickness (px)",
    border_radius: "Border radius (px)",
    colors_gradient: "Colors & Gradient",
    gradient_option: "Gradient (Option)",
    no_gradient: "No gradient",
    smooth_gradient: "Smooth (Flowing)",
    hard_gradient: "Hard (Steps)",
    from_value: "From value:",
    color: "Color:",
    delete_color: "Delete color",
    add_color: "+ Add Color",
    add_new_bar: "+ Add New Bar",
    description: "A card for dynamic progress bars with color thresholds."
  },
  de: {
    title_example: "Pollenflug (Beispiel)",
    unknown: "Unbekannt",
    entity: "Entität",
    title_optional: "Titel (optional)",
    global_design: "Globale Design Einstellungen",
    orientation: "Ausrichtung (Horizontal / Vertikal)",
    horizontal_default: "Horizontal (Standard)",
    vertical: "Vertikal",
    vertical_height: "Höhe der vertikalen Balken (px)",
    layout_position: "Layout (Icon/Name Position)",
    above_bar: "Über dem Balken",
    inline_bar: "Vor dem Balken (Inline)",
    spacing: "Abstand (Icon/Name zu Balken)",
    spacing_placeholder: "z.B. 30% oder 150px",
    value_position: "Wert-Position",
    below_name: "Unter dem Namen (Außen)",
    next_to_name: "Neben dem Namen (Außen)",
    left_of_bar: "Links vom Balken",
    right_of_bar: "Rechts vom Balken",
    above_bar_right: "Direkt über dem Balken (Rechtsbündig)",
    inside_bar: "Im Balken integriert",
    text_alignment_inside: "Textausrichtung (nur bei 'Im Balken')",
    dynamic: "Angepasst an Wert (Dynamisch)",
    bottom: "Unten",
    center: "Mittig",
    top: "Oben",
    left: "Links",
    right: "Rechts",
    value_alignment_outside: "Wert-Ausrichtung (Außerhalb)",
    bars_entities: "Balken (Entitäten)",
    copy_settings: "Kopiere Einstellungen von vorheriger Entität",
    delete_entity: "Entität löschen",
    name_optional: "Name (optional)",
    icon_optional: "Icon (optional, z.B. mdi:tree)",
    icon_color: "Icon-Farbe",
    default_theme: "Standard (Theme)",
    dynamic_color: "Dynamisch (wie Balken)",
    static_color: "Statisch (Feste Farbe)",
    min_value: "Min Wert",
    max_value: "Max Wert",
    bar_thickness: "Balkendicke (px)",
    border_radius: "Eckenradius (px)",
    colors_gradient: "Farben & Verlauf",
    gradient_option: "Farbverlauf (Option)",
    no_gradient: "Kein Verlauf",
    smooth_gradient: "Weich (Fließend)",
    hard_gradient: "Hart (Stufen)",
    from_value: "Ab Wert:",
    color: "Farbe:",
    delete_color: "Farbe löschen",
    add_color: "+ Farbe hinzufügen",
    add_new_bar: "+ Neuen Balken hinzufügen",
    description: "Eine Karte für dynamische Fortschrittsbalken mit Farbschwellenwerten."
  }
};

function localize(key, lang = 'en') {
  const language = lang.substring(0, 2).toLowerCase();
  const validLang = translations[language] ? language : 'en';
  return translations[validLang][key] || key;
}

class DynamicBarCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  static getStubConfig() {
    return {
      title: localize('title_example'),
      entities: [],
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  getCardSize() {
    return (this._config.entities ? this._config.entities.length : 1) + 1;
  }

  static getConfigElement() {
    return document.createElement("dynamic-bar-card-editor");
  }

  _parseColor(colorStr) {
    if (!colorStr) return null;
    this._colorCache = this._colorCache || {};
    if (this._colorCache[colorStr]) return this._colorCache[colorStr];

    if (!this._colorDiv) {
      this._colorDiv = document.createElement('div');
      this._colorDiv.style.display = 'none';
      document.body.appendChild(this._colorDiv);
    }
    this._colorDiv.style.color = colorStr;
    const computed = window.getComputedStyle(this._colorDiv).color;
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      this._colorCache[colorStr] = rgb;
      return rgb;
    }
    return null;
  }

  _interpolateColor(color1, color2, factor) {
    const c1 = this._parseColor(color1);
    const c2 = this._parseColor(color2);
    if (!c1 || !c2) return color1;
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  _getColorForValue(val, conf) {
    const colors = conf.colors;
    if (!colors || colors.length === 0) return "var(--primary-color)";
    
    // Sort colors by value ascending
    const sortedColors = [...colors].sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
    
    if (conf.gradient_type === 'smooth') {
       const firstVal = parseFloat(sortedColors[0].value);
       if (val <= firstVal) return sortedColors[0].color;
       
       const lastVal = parseFloat(sortedColors[sortedColors.length-1].value);
       if (val >= lastVal) return sortedColors[sortedColors.length-1].color;
       
       for (let i = 0; i < sortedColors.length - 1; i++) {
         const c1 = sortedColors[i];
         const c2 = sortedColors[i+1];
         const v1 = parseFloat(c1.value);
         const v2 = parseFloat(c2.value);
         if (val >= v1 && val <= v2) {
           const factor = (val - v1) / (v2 - v1);
           return this._interpolateColor(c1.color, c2.color, factor);
         }
       }
    }

    let activeColor = sortedColors[0].color;
    for (const stop of sortedColors) {
      if (val >= parseFloat(stop.value)) {
        activeColor = stop.color;
      }
    }
    return activeColor;
  }

  _getContrastColor(colorStr) {
    if (!colorStr) return '#ffffff';
    const rgb = this._parseColor(colorStr);
    if (rgb) {
      const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
    }
    return '#ffffff'; // Fallback
  }

  _generateGradient(conf, min, max, isVertical) {
    if (!conf.colors || conf.colors.length === 0) return null;
    const sorted = [...conf.colors].sort((a, b) => a.value - b.value);
    const range = max - min;
    if (range <= 0) return null;
    
    const stops = [];
    const type = conf.gradient_type || 'smooth';

    if (type === 'hard') {
      let currentP = 0;
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        const val = parseFloat(c.value);
        if (isNaN(val)) continue;
        
        let nextP = 100;
        if (i < sorted.length - 1) {
          const nextVal = parseFloat(sorted[i+1].value);
          if (!isNaN(nextVal)) {
            nextP = ((nextVal - min) / range) * 100;
            nextP = Math.max(0, Math.min(100, nextP));
          }
        }
        
        stops.push(`${c.color} ${currentP}%`);
        stops.push(`${c.color} ${nextP}%`);
        
        currentP = nextP;
      }
    } else {
      sorted.forEach(c => {
        const val = parseFloat(c.value);
        if (isNaN(val)) return;
        let p = ((val - min) / range) * 100;
        p = Math.max(0, Math.min(100, p));
        stops.push(`${c.color} ${p}%`);
      });
      if (sorted.length > 0) {
        if (parseFloat(sorted[0].value) > min) stops.unshift(`${sorted[0].color} 0%`);
        if (parseFloat(sorted[sorted.length-1].value) < max) stops.push(`${sorted[sorted.length-1].color} 100%`);
      }
    }
    
    const direction = isVertical ? 'to top' : 'to right';
    return `linear-gradient(${direction}, ${stops.join(', ')})`;
  }

  _getTextColorForPosition(val, min, max, conf, insidePos) {
    const hasGradient = conf.gradient_type && conf.gradient_type !== 'none';
    let valueAtPos = val;
    if (hasGradient) {
      if (insidePos === 'left') {
        valueAtPos = min;
      } else if (insidePos === 'center') {
        valueAtPos = min + (max - min) / 2;
      } else if (insidePos === 'right') {
        valueAtPos = max;
      }
      // 'dynamic' falls through to use 'val'
    }
    const bgColor = this._getColorForValue(valueAtPos, conf);
    return this._getContrastColor(bgColor);
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    const globalValuePos = this._config.value_position || "outside";
    const globalLabelPos = this._config.label_position || "above";
    const labelWidth = this._config.label_width || "30%";
    const insidePos = this._config.inside_position || "dynamic";
    const layoutDir = this._config.layout_direction || "horizontal";
    const isVertical = layoutDir === "vertical";
    const verticalHeight = this._config.vertical_height !== undefined ? this._config.vertical_height : 150;

    return html`
      <ha-card header=${this._config.title || ""}>
        <div class="card-content ${isVertical ? 'layout-vertical' : ''}" style="--label-width: ${labelWidth}; --vertical-height: ${verticalHeight}px;">
          ${(this._config.entities || []).map((conf) => {
            const stateObj = this.hass.states[conf.entity];
            const stateStr = stateObj ? stateObj.state : "0";
            const globalLabelPos = this._config.label_position || 'above';
            const globalValuePos = this._config.value_position || 'outside';
            const insidePos = this._config.inside_position || 'dynamic';
            const outsidePos = this._config.outside_position || 'right';

            const val = parseFloat(stateStr);
            const isNum = !isNaN(val);
            
            const min = conf.min !== undefined ? parseFloat(conf.min) : 0;
            const max = conf.max !== undefined ? parseFloat(conf.max) : 100;
            
            let percentage = 0;
            if (isNum) {
              percentage = ((val - min) / (max - min)) * 100;
              percentage = Math.max(0, Math.min(100, percentage));
            }

            const color = isNum ? this._getColorForValue(val, conf) : "var(--disabled-text-color)";
            const name = conf.name || (stateObj ? stateObj.attributes.friendly_name : conf.entity || localize('unknown', this.hass?.language));
            const icon = conf.icon || (stateObj && stateObj.attributes.icon ? stateObj.attributes.icon : "mdi:chart-bar");
            const unit = stateObj && stateObj.attributes.unit_of_measurement ? stateObj.attributes.unit_of_measurement : "";
            const barHeight = conf.bar_height !== undefined ? conf.bar_height : 12;
            const borderRadius = conf.border_radius !== undefined ? conf.border_radius : 6;

            const scaleStr = percentage > 0 ? (10000 / percentage) + '%' : '0%';
            
            let bgStyle = `background-color: ${color};`;
            if (conf.gradient_type && conf.gradient_type !== 'none' && conf.colors && conf.colors.length > 0) {
              const grad = this._generateGradient(conf, min, max, isVertical);
              if (grad) {
                const bgPos = isVertical ? 'bottom left' : 'top left';
                bgStyle = `background: ${grad}; background-size: ${isVertical ? `100% var(--scale)` : `var(--scale) 100%`}; background-position: ${bgPos};`;
              }
            }

            let appliedIconColor = "";
            if (conf.icon_color_mode === 'dynamic') {
              appliedIconColor = color;
            } else if (conf.icon_color_mode === 'static' && conf.icon_color) {
              appliedIconColor = conf.icon_color;
            }

            return html`
              <div class="row ${globalLabelPos === 'inline' ? 'inline-layout' : ''}" style="--bar-height: ${barHeight}px; --bar-border-radius: ${borderRadius}px; --percentage: ${percentage}%; --scale: ${scaleStr};">
                <div class="info">
                  <ha-icon .icon=${icon} style="${appliedIconColor ? `color: ${appliedIconColor};` : ''}"></ha-icon>
                  <span class="name">${name}</span>
                  ${globalValuePos === 'outside' ? html`<span class="value">${stateStr} ${unit}</span>` : ""}
                </div>
                <div class="bar-container">
                  ${globalValuePos === 'above_bar' ? html`<div class="value value-above pos-${outsidePos}">${stateStr} ${unit}</div>` : ""}
                  ${globalValuePos === 'left_of_bar' ? html`<div class="value value-left pos-${outsidePos}">${stateStr} ${unit}</div>` : ""}
                  ${globalValuePos === 'right_of_bar' ? html`<div class="value value-right pos-${outsidePos}">${stateStr} ${unit}</div>` : ""}
                  <div class="bar-bg">
                    
                    ${globalValuePos === 'inside' && insidePos !== 'dynamic' ? html`
                      <div class="value-inside-wrapper pos-${insidePos}">
                        <span class="value-text" style="color: var(--primary-text-color);">${stateStr} ${unit}</span>
                      </div>
                    ` : ""}

                    <div class="bar-fg" style="${bgStyle}">
                      ${globalValuePos === 'inside' && insidePos !== 'dynamic' ? html`
                        <div class="value-inside-wrapper pos-${insidePos}">
                          <span class="value-text" style="color: ${this._getTextColorForPosition(val, min, max, conf, insidePos)};">${stateStr} ${unit}</span>
                        </div>
                      ` : ""}
                      ${globalValuePos === 'inside' && insidePos === 'dynamic' && percentage >= 15 ? html`
                        <span class="value-text fg-inside" style="color: ${this._getTextColorForPosition(val, min, max, conf, 'dynamic')};">${stateStr} ${unit}</span>
                      ` : ""}
                    </div>
                    
                    ${globalValuePos === 'inside' && insidePos === 'dynamic' && percentage < 15 ? html`
                      <span class="value-text bg-outside" style="${isVertical ? `bottom: calc(${percentage}% + 8px);` : `left: calc(${percentage}% + 8px);`} color: var(--primary-text-color);">${stateStr} ${unit}</span>
                    ` : ""}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .row.inline-layout {
        flex-direction: row;
        align-items: center;
      }
      .row.inline-layout .info {
        flex: 0 0 var(--label-width);
      }
      .row.inline-layout .bar-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .bar-container {
        width: 100%;
      }
      .info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .info ha-icon {
        color: var(--state-icon-color, var(--primary-text-color));
      }
      .name {
        flex: 1;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .value {
        font-weight: bold;
        color: var(--primary-text-color);
      }
      .value-above {
        margin-bottom: 4px;
        font-size: 13px;
        font-weight: bold;
      }
      .value-above.pos-left { text-align: left; }
      .value-above.pos-center { text-align: center; }
      .value-above.pos-right { text-align: right; }
      
      .card-content.layout-vertical {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: flex-end;
        gap: 16px;
        flex-wrap: wrap;
      }
      .card-content.layout-vertical .row {
        flex-direction: column-reverse;
        align-items: center;
        margin-bottom: 0;
        width: auto;
      }
      .card-content.layout-vertical .info {
        flex: none;
        align-items: center;
        text-align: center;
        margin-top: 8px;
        flex-direction: column;
      }
      .card-content.layout-vertical .bar-container {
        height: var(--vertical-height);
        width: var(--bar-height);
        flex: none;
        position: relative;
      }
      .card-content.layout-vertical .value-left,
      .card-content.layout-vertical .value-right {
        position: absolute;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        white-space: nowrap;
        font-size: 11px;
        font-weight: bold;
      }
      .card-content.layout-vertical .value-left {
        right: 100%;
        margin-right: 8px;
      }
      .card-content.layout-vertical .value-right {
        left: 100%;
        margin-left: 8px;
      }
      .card-content.layout-vertical .value-left.pos-left,
      .card-content.layout-vertical .value-right.pos-left {
        bottom: 0;
      }
      .card-content.layout-vertical .value-left.pos-center,
      .card-content.layout-vertical .value-right.pos-center {
        bottom: 50%;
        transform: rotate(180deg) translateY(-50%);
      }
      .card-content.layout-vertical .value-left.pos-right,
      .card-content.layout-vertical .value-right.pos-right {
        top: 0;
      }
      .card-content.layout-vertical .bar-bg {
        width: 100%;
        height: 100%;
      }
      .card-content.layout-vertical .bar-fg {
        width: 100% !important;
        height: var(--percentage);
        top: auto;
        bottom: 0;
      }
      .card-content.layout-vertical .value-inside-wrapper {
        width: 100% !important;
        height: var(--scale);
        top: auto;
        bottom: 0;
        flex-direction: column;
        padding: 8px 0;
      }
      .card-content.layout-vertical .bar-bg > .value-inside-wrapper {
        height: 100% !important;
      }
      .card-content.layout-vertical .value-inside-wrapper.pos-left { justify-content: flex-end; }
      .card-content.layout-vertical .value-inside-wrapper.pos-right { justify-content: flex-start; }
      
      .card-content.layout-vertical .fg-inside {
        right: auto;
        top: 8px;
        left: 0;
        width: 100%;
        height: auto;
        justify-content: center;
      }
      .card-content.layout-vertical .bg-outside {
        top: auto;
        left: 0;
        width: 100%;
        height: auto;
        justify-content: center;
        /* bottom is set inline */
      }
      .card-content.layout-vertical .value-text {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
      }

      .bar-bg {
        width: 100%;
        height: var(--bar-height, 12px);
        background-color: var(--secondary-background-color, rgba(127,127,127,0.2));
        border-radius: var(--bar-border-radius, 6px);
        position: relative;
      }
      .bar-fg {
        width: var(--percentage);
        height: 100%;
        border-radius: var(--bar-border-radius, 6px);
        transition: width 0.3s ease-out, height 0.3s ease-out, background-color 0.3s ease-out;
        position: absolute;
        top: 0;
        left: 0;
        overflow: hidden;
      }
      .value-inside-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: var(--scale);
        height: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 8px;
        pointer-events: none;
      }
      .bar-bg > .value-inside-wrapper {
        width: 100% !important;
      }
      .value-inside-wrapper.pos-left { justify-content: flex-start; }
      .value-inside-wrapper.pos-center { justify-content: center; }
      .value-inside-wrapper.pos-right { justify-content: flex-end; }
      
      .value-text {
        font-weight: bold;
        font-size: 11px;
        white-space: nowrap;
        pointer-events: none;
      }
      
      .fg-inside {
        position: absolute;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
        right: 8px;
      }
      .bg-outside {
        position: absolute;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
      }
    `;
  }
}

customElements.define("dynamic-bar-card", DynamicBarCard);

// --- EDITOR ---

class DynamicBarCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    this._config = config;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const val = target.value !== undefined ? target.value : (ev.detail && ev.detail.value);
    if (this[`_${target.configValue}`] === val) {
      return;
    }
    
    let newConfig = { ...this._config };
    if (target.configValue) {
      if (val === "") {
        delete newConfig[target.configValue];
      } else {
        newConfig[target.configValue] = val;
      }
    }
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _entityValueChanged(ev, index, field) {
    const target = ev.target;
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    let entity = { ...entities[index] };

    if (!target.value && target.value !== "" && !(ev.detail && ev.detail.value)) {
       // Falls value undefiniert ist und detail.value auch leer
       delete entity[field];
    } else if (target.value === "") {
      delete entity[field];
    } else {
      let val = target.value !== undefined ? target.value : (ev.detail && ev.detail.value);
      if (field === 'min' || field === 'max') {
        val = parseFloat(val);
      }
      entity[field] = val;
    }

    entities[index] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _dragStart(ev, index) {
    this._draggedIndex = index;
    this._targetIndex = index;
    ev.dataTransfer.effectAllowed = 'move';
    
    const draggedEl = ev.currentTarget;
    const rect = draggedEl.getBoundingClientRect();
    
    // Pass the already-rendered header to setDragImage.
    // This gives a nice compact ghost image and prevents the browser from screenshotting the whole screen.
    const headerEl = draggedEl.querySelector('.entity-header');
    if (headerEl && ev.dataTransfer.setDragImage) {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      ev.dataTransfer.setDragImage(headerEl, x, y);
    }
    
    this._placeholder = document.createElement('div');
    this._placeholder.className = 'drag-placeholder';
    this._placeholder.style.height = rect.height + 'px';
    this._placeholder.style.border = '2px dashed var(--primary-color)';
    this._placeholder.style.borderRadius = '4px';
    this._placeholder.style.marginBottom = '8px';
    this._placeholder.style.backgroundColor = 'rgba(127,127,127,0.05)';
    this._placeholder.style.boxSizing = 'border-box';
    this._placeholder.style.pointerEvents = 'none';

    // Wait 50ms to allow the browser to fully capture the ghost image before we hide it.
    // If this is too short, Chrome panics and captures the whole screen.
    setTimeout(() => {
      draggedEl.style.display = 'none';
      if (draggedEl.parentNode) {
        draggedEl.parentNode.insertBefore(this._placeholder, draggedEl.nextSibling);
      }
    }, 50);

    if (this.shadowRoot) {
      const container = this.shadowRoot.querySelector('.entities-config');
      if (container) container.classList.add('is-dragging');
    }
  }

  _dragOver(ev, dropIndex) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    
    if (this._draggedIndex === null || !this._placeholder) return;
    
    const target = ev.currentTarget;
    const rect = target.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    
    if (ev.clientY < mid) {
      target.parentNode.insertBefore(this._placeholder, target);
      this._targetIndex = dropIndex;
    } else {
      target.parentNode.insertBefore(this._placeholder, target.nextSibling);
      this._targetIndex = dropIndex + 1;
    }
  }

  _dragEnd(ev) {
    if (ev && ev.currentTarget) {
      ev.currentTarget.style.display = '';
    }
    this._draggedIndex = null;
    this._targetIndex = null;
    if (this._placeholder && this._placeholder.parentNode) {
      this._placeholder.parentNode.removeChild(this._placeholder);
    }
    this._placeholder = null;

    if (this.shadowRoot) {
      const container = this.shadowRoot.querySelector('.entities-config');
      if (container) container.classList.remove('is-dragging');
    }
  }

  _drop(ev) {
    ev.preventDefault();
    
    if (this._draggedIndex === null || this._targetIndex === null) {
      this._dragEnd(ev);
      return;
    }
    
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    
    const draggedItem = entities.splice(this._draggedIndex, 1)[0];
    
    let finalIndex = this._targetIndex;
    if (this._draggedIndex < this._targetIndex) {
       finalIndex--;
    }
    
    entities.splice(finalIndex, 0, draggedItem);
    
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
    
    this._dragEnd(ev);
  }

  _addEntity() {
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    entities.push({ entity: "", min: 0, max: 100, colors: [] });
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _removeEntity(index) {
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    entities.splice(index, 1);
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _addColor(entityIndex) {
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    let entity = { ...entities[entityIndex] };
    let colors = [...(entity.colors || [])];
    colors.push({ value: 0, color: "green" });
    entity.colors = colors;
    entities[entityIndex] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _removeColor(entityIndex, colorIndex) {
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    let entity = { ...entities[entityIndex] };
    let colors = [...(entity.colors || [])];
    colors.splice(colorIndex, 1);
    entity.colors = colors;
    entities[entityIndex] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _colorValueChanged(ev, entityIndex, colorIndex, field) {
    const target = ev.target;
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    let entity = { ...entities[entityIndex] };
    let colors = [...(entity.colors || [])];
    let color = { ...colors[colorIndex] };

    let val = target.value !== undefined ? target.value : (ev.detail && ev.detail.value);
    if (field === 'value') {
       val = parseFloat(val) || 0;
    }
    color[field] = val;
    
    colors[colorIndex] = color;
    entity.colors = colors;
    entities[entityIndex] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  _entityPickerChanged(ev, index) {
    if (!this._config || !this.hass) return;
    
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    let entity = { ...entities[index] };

    const val = ev.detail.value;
    if (!val) {
      delete entity.entity;
    } else {
      entity.entity = val;
    }

    entities[index] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="field">
          <label>${localize('title_optional', this.hass?.language)}</label>
          <input
            type="text"
            class="styled-input"
            .value=${this._config.title || ""}
            .configValue=${"title"}
            @input=${this._valueChanged}
          />
        </div>

        <h3>${localize('global_design', this.hass?.language)}</h3>
        <div class="entity-config" style="margin-bottom: 16px; background: rgba(3, 169, 244, 0.05); border-color: rgba(3, 169, 244, 0.3);">
          <div class="field-row">
            <div class="field">
              <label>${localize('orientation', this.hass?.language)}</label>
              <select class="styled-input" .configValue=${"layout_direction"} @input=${this._valueChanged}>
                <option value="horizontal" ?selected=${(this._config.layout_direction || 'horizontal') === 'horizontal'}>${localize('horizontal_default', this.hass?.language)}</option>
                <option value="vertical" ?selected=${this._config.layout_direction === 'vertical'}>${localize('vertical', this.hass?.language)}</option>
              </select>
            </div>
            ${this._config.layout_direction === 'vertical' ? html`
              <div class="field">
                <label>${localize('vertical_height', this.hass?.language)}</label>
                <input type="number" class="styled-input" .value=${this._config.vertical_height !== undefined ? this._config.vertical_height : 150} .configValue=${"vertical_height"} @input=${this._valueChanged} />
              </div>
            ` : html`
              <div class="field"></div>
            `}
          </div>

          ${this._config.layout_direction !== 'vertical' ? html`
            <div class="field-row" style="margin-top: 12px;">
              <div class="field">
                <label>${localize('layout_position', this.hass?.language)}</label>
                <select class="styled-input" .configValue=${"label_position"} @input=${this._valueChanged}>
                  <option value="above" ?selected=${(this._config.label_position || 'above') === 'above'}>${localize('above_bar', this.hass?.language)}</option>
                  <option value="inline" ?selected=${this._config.label_position === 'inline'}>${localize('inline_bar', this.hass?.language)}</option>
                </select>
              </div>
              <div class="field">
                <label>${localize('spacing', this.hass?.language)}</label>
                <input type="text" class="styled-input" .value=${this._config.label_width || "30%"} placeholder="${localize('spacing_placeholder', this.hass?.language)}" .configValue=${"label_width"} @input=${this._valueChanged} />
              </div>
            </div>
          ` : ""}
          <div class="field-row" style="margin-top: 12px;">
            <div class="field">
              <label>${localize('value_position', this.hass?.language)}</label>
              <select class="styled-input" .configValue=${"value_position"} @input=${this._valueChanged}>
                ${this._config.layout_direction === 'vertical' ? html`
                  <option value="outside" ?selected=${(this._config.value_position || 'outside') === 'outside'}>${localize('below_name', this.hass?.language)}</option>
                  <option value="left_of_bar" ?selected=${this._config.value_position === 'left_of_bar'}>${localize('left_of_bar', this.hass?.language)}</option>
                  <option value="right_of_bar" ?selected=${this._config.value_position === 'right_of_bar'}>${localize('right_of_bar', this.hass?.language)}</option>
                  <option value="inside" ?selected=${this._config.value_position === 'inside'}>${localize('inside_bar', this.hass?.language)}</option>
                ` : html`
                  <option value="outside" ?selected=${(this._config.value_position || 'outside') === 'outside'}>${localize('next_to_name', this.hass?.language)}</option>
                  <option value="above_bar" ?selected=${this._config.value_position === 'above_bar'}>${localize('above_bar_right', this.hass?.language)}</option>
                  <option value="inside" ?selected=${this._config.value_position === 'inside'}>${localize('inside_bar', this.hass?.language)}</option>
                `}
              </select>
            </div>
            
            ${this._config.value_position === 'inside' ? html`
              <div class="field">
                <label>${localize('text_alignment_inside', this.hass?.language)}</label>
                <select class="styled-input" .configValue=${"inside_position"} @input=${this._valueChanged}>
                  ${this._config.layout_direction === 'vertical' ? html`
                    <option value="dynamic" ?selected=${(this._config.inside_position || 'dynamic') === 'dynamic'}>${localize('dynamic', this.hass?.language)}</option>
                    <option value="left" ?selected=${this._config.inside_position === 'left'}>${localize('bottom', this.hass?.language)}</option>
                    <option value="center" ?selected=${this._config.inside_position === 'center'}>${localize('center', this.hass?.language)}</option>
                    <option value="right" ?selected=${this._config.inside_position === 'right'}>${localize('top', this.hass?.language)}</option>
                  ` : html`
                    <option value="dynamic" ?selected=${(this._config.inside_position || 'dynamic') === 'dynamic'}>${localize('dynamic', this.hass?.language)}</option>
                    <option value="left" ?selected=${this._config.inside_position === 'left'}>${localize('left', this.hass?.language)}</option>
                    <option value="center" ?selected=${this._config.inside_position === 'center'}>${localize('center', this.hass?.language)}</option>
                    <option value="right" ?selected=${this._config.inside_position === 'right'}>${localize('right', this.hass?.language)}</option>
                  `}
                </select>
              </div>
            ` : html`
              <div class="field">
                <label>${localize('value_alignment_outside', this.hass?.language)}</label>
                <select class="styled-input" .configValue=${"outside_position"} @input=${this._valueChanged}>
                  ${this._config.layout_direction === 'vertical' ? html`
                    <option value="left" ?selected=${this._config.outside_position === 'left'}>${localize('bottom', this.hass?.language)}</option>
                    <option value="center" ?selected=${this._config.outside_position === 'center'}>${localize('center', this.hass?.language)}</option>
                    <option value="right" ?selected=${(this._config.outside_position || 'right') === 'right'}>${localize('top', this.hass?.language)}</option>
                  ` : html`
                    <option value="left" ?selected=${this._config.outside_position === 'left'}>${localize('left', this.hass?.language)}</option>
                    <option value="center" ?selected=${this._config.outside_position === 'center'}>${localize('center', this.hass?.language)}</option>
                    <option value="right" ?selected=${(this._config.outside_position || 'right') === 'right'}>${localize('right', this.hass?.language)}</option>
                  `}
                </select>
              </div>
            `}
          </div>
        </div>
        
        <h3>${localize('bars_entities', this.hass?.language)}</h3>
        <div class="entities-config"
             @dragover=${(e) => e.preventDefault()}
             @drop=${(e) => this._drop(e)}
        >
          ${(this._config.entities || []).map((entity, index) => {
            return html`
              <details class="entity-config" style="margin-bottom: 8px;"
                draggable="true"
                @dragstart=${(e) => this._dragStart(e, index)}
                @dragover=${(e) => this._dragOver(e, index)}
                @dragend=${this._dragEnd}
              >
                <summary class="entity-header" style="cursor: grab; font-weight: bold; padding: 8px; background: rgba(127,127,127,0.1); border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <ha-icon icon="mdi:drag" style="color: var(--secondary-text-color);"></ha-icon>
                    <span>${entity.name || entity.entity || `${localize('entity', this.hass?.language)} ${index + 1}`}</span>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    ${index > 0 ? html`
                      <button class="icon-button" @click=${(e) => { e.preventDefault(); this._copySettings(index); }} title="${localize('copy_settings', this.hass?.language)}">
                        <ha-icon icon="mdi:content-copy"></ha-icon>
                      </button>
                    ` : ""}
                    <button class="icon-button delete" @click=${(e) => { e.preventDefault(); this._removeEntity(index); }} title="${localize('delete_entity', this.hass?.language)}">
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </button>
                  </div>
                </summary>
                <div class="entity-body" style="padding: 12px 8px;">
                  <div class="field">
                    <ha-entity-picker
                      label="Entity ID"
                      .hass=${this.hass}
                      .value=${entity.entity || ""}
                      .includeDomains=${["sensor", "number", "input_number", "counter"]}
                      @value-changed=${(e) => this._entityPickerChanged(e, index)}
                      allow-custom-entity
                    ></ha-entity-picker>
                  </div>
                  
                  <div class="field-row" style="margin-top: 12px;">
                    <div class="field">
                      <label>${localize('name_optional', this.hass?.language)}</label>
                      <input type="text" class="styled-input" .value=${entity.name || ""} @input=${(e) => this._entityValueChanged(e, index, "name")} />
                    </div>
                    <div class="field">
                      <ha-icon-picker label="${localize('icon_optional', this.hass?.language)}" .value=${entity.icon || ""} @value-changed=${(e) => this._entityValueChanged(e, index, "icon")}></ha-icon-picker>
                    </div>
                  </div>

                  <div class="field-row">
                    <div class="field">
                      <label>${localize('icon_color', this.hass?.language)}</label>
                      <select class="styled-input" @input=${(e) => this._entityValueChanged(e, index, "icon_color_mode")}>
                        <option value="default" ?selected=${(entity.icon_color_mode || 'default') === 'default'}>${localize('default_theme', this.hass?.language)}</option>
                        <option value="dynamic" ?selected=${entity.icon_color_mode === 'dynamic'}>${localize('dynamic_color', this.hass?.language)}</option>
                        <option value="static" ?selected=${entity.icon_color_mode === 'static'}>${localize('static_color', this.hass?.language)}</option>
                      </select>
                    </div>
                    ${entity.icon_color_mode === 'static' ? html`
                      <div class="field">
                        <label>${localize('static_color', this.hass?.language)}</label>
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input type="color" .value=${entity.icon_color && entity.icon_color.startsWith('#') ? entity.icon_color : '#03a9f4'} @input=${(e) => this._entityValueChanged(e, index, "icon_color")} style="height: 42px; width: 42px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                          <input type="text" class="styled-input" .value=${entity.icon_color || ""} @input=${(e) => this._entityValueChanged(e, index, "icon_color")} style="flex: 1;" />
                        </div>
                      </div>
                    ` : html`<div class="field"></div>`}
                  </div>

                  <div class="field-row">
                    <div class="field">
                      <label>${localize('min_value', this.hass?.language)}</label>
                      <input type="number" step="any" class="styled-input" .value=${entity.min !== undefined ? entity.min : 0} @input=${(e) => this._entityValueChanged(e, index, "min")} />
                    </div>
                    <div class="field">
                      <label>${localize('max_value', this.hass?.language)}</label>
                      <input type="number" step="any" class="styled-input" .value=${entity.max !== undefined ? entity.max : 100} @input=${(e) => this._entityValueChanged(e, index, "max")} />
                    </div>
                  </div>

                  <div class="field-row">
                    <div class="field">
                      <label>${localize('bar_thickness', this.hass?.language)}</label>
                      <input type="number" class="styled-input" .value=${entity.bar_height !== undefined ? entity.bar_height : 12} @input=${(e) => this._entityValueChanged(e, index, "bar_height")} />
                    </div>
                    <div class="field">
                      <label>${localize('border_radius', this.hass?.language)}</label>
                      <input type="number" class="styled-input" .value=${entity.border_radius !== undefined ? entity.border_radius : 6} @input=${(e) => this._entityValueChanged(e, index, "border_radius")} />
                    </div>
                  </div>

                  <div class="colors-section">
                    <h5 style="margin: 0 0 12px 0;">${localize('colors_gradient', this.hass?.language)}</h5>
                    <div class="field-row" style="margin-bottom: 12px;">
                      <div class="field">
                        <label>${localize('gradient_option', this.hass?.language)}</label>
                        <select class="styled-input" @input=${(e) => this._entityValueChanged(e, index, "gradient_type")}>
                          <option value="none" ?selected=${(entity.gradient_type || 'none') === 'none'}>${localize('no_gradient', this.hass?.language)}</option>
                          <option value="smooth" ?selected=${entity.gradient_type === 'smooth'}>${localize('smooth_gradient', this.hass?.language)}</option>
                          <option value="hard" ?selected=${entity.gradient_type === 'hard'}>${localize('hard_gradient', this.hass?.language)}</option>
                        </select>
                      </div>
                    </div>
                    ${(entity.colors || []).map((c, cIndex) => {
                      return html`
                        <div class="color-row">
                          <div class="field" style="max-width: 100px;">
                            <label>${localize('from_value', this.hass?.language)}</label>
                            <input type="number" step="any" class="styled-input" .value=${c.value !== undefined ? c.value : 0} @input=${(e) => this._colorValueChanged(e, index, cIndex, "value")} />
                          </div>
                          <div class="field" style="flex: 1;">
                            <label>${localize('color', this.hass?.language)}</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                              <input type="color" .value=${c.color && c.color.startsWith('#') ? c.color : '#03a9f4'} @input=${(e) => this._colorValueChanged(e, index, cIndex, "color")} style="height: 42px; width: 42px; padding: 0; border: none; border-radius: 4px; cursor: pointer; background: transparent;" />
                              <input type="text" class="styled-input" .value=${c.color || ""} @input=${(e) => this._colorValueChanged(e, index, cIndex, "color")} style="flex: 1;" />
                            </div>
                          </div>
                          <button class="icon-button delete" style="margin-top: 18px;" @click=${() => this._removeColor(index, cIndex)} title="${localize('delete_color', this.hass?.language)}">
                            <ha-icon icon="mdi:delete"></ha-icon>
                          </button>
                        </div>
                      `;
                    })}
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                      <button class="btn-add" style="margin-top: 8px;" @click=${() => this._addColor(index)}>${localize('add_color', this.hass?.language)}</button>
                    </div>
                  </div>
                </div>
              </details>
            `;
          })}
        </div>
        
        <button class="btn-add-entity" @click=${this._addEntity}>${localize('add_new_bar', this.hass?.language)}</button>
      </div>
    `;
  }

  _copySettings(entityIndex) {
    if (entityIndex === 0) return;
    let newConfig = { ...this._config };
    let entities = [...(newConfig.entities || [])];
    
    let prevEntity = entities[entityIndex - 1];
    if (!prevEntity) return;
    
    let entity = { ...entities[entityIndex] };
    
    if (prevEntity.colors) entity.colors = prevEntity.colors.map(c => ({...c}));
    if (prevEntity.min !== undefined) entity.min = prevEntity.min;
    if (prevEntity.max !== undefined) entity.max = prevEntity.max;
    if (prevEntity.bar_height !== undefined) entity.bar_height = prevEntity.bar_height;
    if (prevEntity.border_radius !== undefined) entity.border_radius = prevEntity.border_radius;
    if (prevEntity.gradient_type !== undefined) entity.gradient_type = prevEntity.gradient_type;
    
    entities[entityIndex] = entity;
    newConfig.entities = entities;
    fireEvent(this, "config-changed", { config: newConfig });
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .field-row {
        display: flex;
        gap: 12px;
      }
      label {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .styled-input, select.styled-input {
        width: 100%;
        padding: 12px 16px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background-color: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        box-sizing: border-box;
      }
      .styled-input:focus, select.styled-input:focus {
        outline: none;
        border-color: var(--primary-color);
      }
      h3, h4, h5 {
        margin: 0;
        color: var(--primary-text-color);
      }
      h3 { margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid var(--divider-color); padding-bottom: 4px; }
      .entity-config {
        border: 1px solid var(--divider-color, #eee);
        padding: 12px;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: rgba(127,127,127,0.05);
      }
      .entity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .colors-section {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed var(--divider-color);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .color-row {
        display: flex;
        gap: 12px;
        font-size: 14px;
        align-items: flex-start;
      }
      .color-row .btn-remove {
        margin-top: 12px;
      }
      button {
        cursor: pointer;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, white);
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
      }
      button.btn-remove {
        background: var(--error-color, #f44336);
        padding: 4px 8px;
      }
      button.btn-add {
        background: var(--secondary-text-color, #727272);
        align-self: flex-start;
      }
      button.btn-add-entity {
        margin-top: 16px;
        align-self: center;
      }
      .entity-config {
        transition: padding 0.1s ease, border 0.1s ease;
      }
      .entities-config.is-dragging .entity-config * {
        pointer-events: none;
      }
      .drag-hidden {
        opacity: 0 !important;
        height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: hidden !important;
        border: none !important;
      }
      .drag-over-top {
        border-top: 2px dashed var(--primary-color) !important;
        padding-top: 24px !important;
      }
      .drag-over-bottom {
        border-bottom: 2px dashed var(--primary-color) !important;
        padding-bottom: 24px !important;
      }
    `;
  }
}

customElements.define("dynamic-bar-card-editor", DynamicBarCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "dynamic-bar-card",
  name: "Dynamic Bar Card",
  preview: true,
  description: localize('description'),
});

console.info(
  `%c DYNAMIC-BAR-CARD %c v0.0.1b `,
  'color: white; background: #03a9f4; font-weight: 700;',
  'color: #03a9f4; background: white; font-weight: 700;'
);
