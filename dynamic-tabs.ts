
export class Tab<T extends Record<string, any>> {
  public element = document.createElement('div');
  private inputs = new Map<string, any>();
  private name: string = '';
  public constructor() {
    this.element.className = 'tab-content';
    // inputs.forEach(input => this.element.appendChild(renderUserInput(input)));
  }

  public setName(name: string) {
    this.name = name;
  }

  private inputChangeListeners: (() => void)[] = [];
  public addInputListener(listener: () => void) {
    this.inputChangeListeners.push(listener);
  }
  private inputWasChanged() {
    this.inputChangeListeners.forEach(l => l());
  }

  private renderLabel(labelString: string, hideLabel: boolean) {
    if (hideLabel) return;
    const label = document.createElement('h3');
    label.innerText = labelString;
    label.className = 'text-label';
    this.element.appendChild(label);
  }

  public text<N extends string>(label: N, hideLabel = false): Tab<T & Record<N, string | undefined>> {
    this.renderLabel(label, hideLabel);
    const textInput = document.createElement('input');
    textInput.className = 'text-input';
    textInput.type = 'text';
    textInput.onkeyup = () => {
      this.inputs.set(
        label,
        textInput.value.length == 0 ? undefined : textInput.value
      );
      this.inputWasChanged();
    };
    this.element.appendChild(textInput);
    return this;
  }

  public number<N extends string>(label: N, hideLabel = false): Tab<T & Record<N, number | undefined>> {
    this.renderLabel(label, hideLabel);
    const numberInput = document.createElement('input');
    numberInput.className = 'number-input';
    numberInput.type = 'number';
    numberInput.onkeyup = () => {
      this.inputs.set(
        label,
        numberInput.value.length == 0 ? undefined : parseFloat(numberInput.value)
      );
      this.inputWasChanged();
    };
    this.element.appendChild(numberInput);
    return this;
  }

  public select<N extends string>(label: N, options: string[], hideLabel?: boolean): Tab<T & Record<N, string | undefined>>;
  public select<N extends string, O>(label: N, options: Record<string, O>, hideLabel?: boolean): Tab<T & Record<N, O | undefined>>;
  public select(label: string, options: string[] | Record<string, any>, hideLabel = false) {
    this.renderLabel(label, hideLabel);
    let optionStrings: string[] = [ '' ];
    if (Array.isArray(options)) {
      optionStrings.push(...options);
    } else {
      optionStrings.push(...Object.keys(options));
    }
    const selectInput = document.createElement('select');
    selectInput.className = 'select-input';
    optionStrings.forEach(o => {
      const option = document.createElement('option');
      option.text = o;
      selectInput.appendChild(option);
    });
    selectInput.onchange = () => {
      const val = Array.isArray(options) ? selectInput.value : (options[selectInput.value] ?? '');
      this.inputs.set(label, val.length == 0 ? undefined : val);
      this.inputWasChanged();
    };
    this.element.appendChild(selectInput);
    return this;
  }

  public horizontalNumbers<N extends string, K extends [...string[]]>(label: N, labels: K, hideLabel = true): Tab<T & Record<N, { [J in keyof K]: number }>> {
    this.inputs.set(label, new Array(labels.length).fill(0));
    this.renderLabel(label, hideLabel);
    const horizElement = document.createElement('div');
    horizElement.className = 'horizontal-container'
    for (let i = 0; i < labels.length; i++) {
      const labelElement = document.createElement('h3');
      labelElement.innerText = labels[i];
      labelElement.className = 'text-label';
      horizElement.appendChild(labelElement);
      const numberInput = document.createElement('input');
      numberInput.className = 'number-input';
      numberInput.type = 'number';
      numberInput.onkeyup = () => {
        this.inputs.get(label)[i] = numberInput.value.length == 0
          ? 0 : parseFloat(numberInput.value);
        this.inputWasChanged();
      };
      horizElement.appendChild(numberInput);
    }
    this.element.appendChild(horizElement);
    return this;
  }

  public tryGetValue<K extends keyof T & string>(valueKey: K): T[K] {
    if (!this.inputs.has(valueKey)) {
      throw new Error(`Tab \`${this.name}\` doesn't have input \`${valueKey}\`!`);
    }
    return this.inputs.get(valueKey) as T[K];
  }
  public getValue<K extends keyof T & string>(valueKey: K): NonNullable<T[K]> {
    const val = this.tryGetValue(valueKey);
    if (val === undefined || val === null) {
      throw new Error(`This value is undefined!`);
    }
    return val;
  }
}

export class DynamicTabs<T extends Record<string, Record<string, any>>> {
  private tabs = new Map<string, Tab<any>>();

  public constructor(
    public parentElement: HTMLElement
  ) {}

  public addTab<N extends string, K extends Record<string, any>>(tabName: N, tab: Tab<K>): DynamicTabs<T & Record<N, K>> {
    this.tabs.set(tabName, tab);
    tab.setName(tabName);

    // TODO: multiple tabs
    this.parentElement.appendChild(tab.element);
    return this as DynamicTabs<T & Record<N, K>>;
  }

  public getValue<TabName extends keyof T & string, InputName extends keyof T[TabName] & string>(
    tabName: TabName,
    inputName: InputName,
  ): T[TabName][InputName] {
    if (!this.tabs.has(tabName)) {
      throw new Error(`Tab \`${tabName}\` not found!`);
    }
    return this.tabs.get(tabName)!.getValue(inputName);
  }

  public tryGetValue<TabName extends keyof T & string, InputName extends keyof T[TabName] & string>(
    tabName: TabName,
    inputName: InputName,
  ): T[TabName][InputName] {
    return this.tabs.get(tabName)?.tryGetValue(inputName);
  }

  public goto(tabName: string) {
    // TODO: switch tabs
  }
}
