import moment from 'moment';
import {
  OptionsSection,
  OptionsSectionGrouped,
  VariantsCreateFormData,
  VariantsEditFormData,
  VariantsSection,
} from '../../shared/interfaces/section.interface';

export function groupOptions(options: OptionsSection[]): OptionsSectionGrouped[] {
  return options.reduce<OptionsSectionGrouped[]>((acc, opt) => {
    const index: number = acc.findIndex(item => item.name === opt.name);
    if (index > -1) {
      acc[index].value.push(opt.value);
    } else {
      acc.push({ name: opt.name, value: [opt.value], type: opt.type });
    }

    return acc;
  }, []);
}

export function allPossibleCases(arr: OptionsSectionGrouped[]): OptionsSection[][] {
  const result = arr
    .reduce((acc, val) => [...acc, val.value], [])
    .reduce((a, b) => a.reduce((r: string[], v: string) => r.concat(b.map((w: string) => [].concat(v, w))), []));

  return result.map((opt: string[]) => {
    if (typeof opt !== 'object') {
      return [{ name: arr[0].name, value: opt, type: arr[0].type }];
    }

    return opt.reduce((acc, val, ind) => {
      acc.push({ name: arr[ind].name, value: val, type: arr[ind].type });

      return acc;
    }, []);
  });
}

export function mapVariantToFormData(
  variant: VariantsSection,
  edit: boolean,
): VariantsEditFormData | VariantsCreateFormData {
  return edit ? { ...variant, type: 'edit' } : { ...variant, options: groupOptions(variant.options), type: 'create' };
}

export function mapVariantFormDataToVariant(variant: VariantsEditFormData | VariantsCreateFormData): VariantsSection[] {
  if (variant.type === 'edit') {
    const options: OptionsSection[] = [...variant.options];
    if (!options[options.length - 1].name || !options[options.length - 1].value.length) {
      options.pop();
    }
    const newVariant = { ...variant, options };
    newVariant.sale = {
      onSales: newVariant.onSales,
      salePrice: newVariant.salePrice,
      saleEndDate: newVariant.saleEndDate && moment(newVariant.saleEndDate, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      saleStartDate: newVariant.saleStartDate && moment(newVariant.saleStartDate, 'DD.MM.YYYY').format('YYYY-MM-DD'),
    };

    delete newVariant.type;

    return [{ ...newVariant }];
  } else {
    const options: OptionsSectionGrouped[] = [...variant.options];
    if (!options[options.length - 1].name || !options[options.length - 1].value.length) {
      options.pop();
    }
    const splittedOptions = allPossibleCases(options);

    return splittedOptions.map((value: OptionsSection[]) => {
      const newVariant = { ...variant };
      delete newVariant.type;

      return {
        ...newVariant,
        options: value,
      };
    });
  }
}
