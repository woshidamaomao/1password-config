import { item as onePItem } from '@1password/op-js';
import type { Item } from '@1password/op-js';

// 定义配置字段的类型
type ConfigFieldSpec = {
    key?: string;           // 匹配 1Password 中的字段名（可选，默认为对象的 key）
    default?: string;       // 默认值（可选）
    description?: string;   // 描述信息（无功能作用）
};

// 配置键可以是字符串或配置对象
type ConfigValue = string | ConfigFieldSpec;

// 配置映射类型
type ConfigMap = Record<string, ConfigValue>;

// 结果字段类型，包含匹配状态
type ConfigResult = {
    value: string | undefined;
    matched: boolean;
    description?: string;
};

// 配置选项类型
type GetConfigOptions = {
    detailedResult?: boolean;  // 是否返回详细格式，默认 false
};

// 简化结果类型，只返回值
type SimpleConfigFromMap<T extends ConfigMap> = {
    [K in keyof T]: string | undefined;
};

// 详细结果类型，包含完整信息
type DetailedConfigFromMap<T extends ConfigMap> = {
    [K in keyof T]: ConfigResult;
};

type OnePasswordItemIdOrName = string;

const getFieldValue = (item: Item, fieldId: string): string | undefined => {
    const field = item.fields?.find((f: any) =>
        f.id === fieldId ||
        f.label?.toLowerCase() === fieldId.toLowerCase()
    );

    return field?.value;
};

// 函数重载：返回简化格式
export function getConfig<T extends ConfigMap>(
    idOrName: OnePasswordItemIdOrName,
    keyOptions: T,
    options?: { detailedResult?: false }
): Promise<SimpleConfigFromMap<T>>;

// 函数重载：返回详细格式
export function getConfig<T extends ConfigMap>(
    idOrName: OnePasswordItemIdOrName,
    keyOptions: T,
    options: { detailedResult: true }
): Promise<DetailedConfigFromMap<T>>;

// 实现函数
export async function getConfig<T extends ConfigMap>(
    idOrName: OnePasswordItemIdOrName,
    keyOptions: T,
    options: GetConfigOptions = {}
): Promise<SimpleConfigFromMap<T> | DetailedConfigFromMap<T>> {
    const onePConfigResult = await onePItem.get(idOrName) as Item;
    if (!onePConfigResult || !onePConfigResult.id) {
        throw new Error(`Item with name or UUID "${idOrName}" not found.`);
    }

    const { detailedResult = false } = options;
    const detailedResult_tmp: Record<string, ConfigResult> = {};
    
    Object.entries(keyOptions).forEach(([configKey, configValue]) => {
        let fieldKey: string;
        let defaultValue: string | undefined;
        let description: string | undefined;

        if (typeof configValue === 'string') {
            // 如果值是字符串，则作为描述，匹配键为配置键本身
            fieldKey = configKey;
            description = configValue;
        } else {
            // 如果值是对象，解析配置
            fieldKey = configValue.key || configKey;
            defaultValue = configValue.default;
            description = configValue.description;
        }

        const foundValue = getFieldValue(onePConfigResult, fieldKey);
        const matched = foundValue !== undefined;
        const finalValue = matched ? foundValue : defaultValue;

        detailedResult_tmp[configKey] = {
            value: finalValue,
            matched,
            description
        };
    });

    // 根据选项返回不同格式
    if (detailedResult) {
        return detailedResult_tmp as DetailedConfigFromMap<T>;
    } else {
        // 返回简化格式，只包含值
        const simpleResult: Record<string, string | undefined> = {};
        Object.entries(detailedResult_tmp).forEach(([key, result]) => {
            simpleResult[key] = result.value;
        });
        return simpleResult as SimpleConfigFromMap<T>;
    }
};

