import { fakerStrategies } from "./config";

/**
 * 根据 key 获取 faker 数据
 * @param key fakerStrategies 的 key
 * @returns 生成的数据
 */
export function generateFakerData(faker: any, key: string): string {
    const strategy = fakerStrategies[key];
    if (strategy) {
        return strategy.generate(faker);
    }
    return '';
}



// export function executeCustomFaker(faker: any, customFaker: string): string {
//     try {
//         // 匹配 faker 方法调用，例如 "faker.number.int(5)" 或 "faker.helpers.arrayElement(['A', 'B'])"
//         const match = customFaker.match(/^faker\.([\w.]+)\((.*)\)$/);
//         if (match) {
//             const methodPath = match[1].split('.'); // 分割方法路径
//             const argsString = match[2]; // 提取参数字符串
//             let method = faker;

//             // 遍历路径，找到对应的 faker 方法
//             for (const key of methodPath) {
//                 method = method[key];
//                 if (!method) {
//                     throw new Error(`无效的 faker 方法路径: ${customFaker}`);
//                 }
//             }

//             // 解析参数字符串为实际参数
//             const args = argsString ? JSON.parse(`[${argsString}]`) : []; // 将参数字符串解析为数组

//             // 确保方法是可调用的函数
//             if (typeof method === 'function') {
//                 return (method as (...args: any[]) => string)(...args); // 调用 faker 方法并传递参数
//             }
//         }
//         throw new Error(`无效的 faker 方法格式: ${customFaker}`);
//     } catch (error) {
//         console.error(`执行自定义 faker 方法失败: ${error.message}`);
//         return ''; // 返回空字符串以避免中断
//     }
// }



//  支持模板
export function executeCustomFaker(faker: any, customFaker: string): string {
    try {
        // 如果输入为空，直接返回空字符串
        if (!customFaker || typeof customFaker !== 'string') {
            throw new Error('输入的自定义 faker 代码为空或无效');
        }

        // 检查是否为模板字符串（包含 ${}）
        if (customFaker.includes('${')) {
            // 使用正则匹配模板字符串中的表达式，例如 "${faker.name.firstName()}hello"
            return customFaker.replace(/\$\{([^}]+)\}/g, (_, expression) => {
                try {
                    // 递归调用解析表达式
                    return executeCustomFaker(faker, expression.trim());
                } catch (error) {
                    console.error(`解析模板表达式失败: ${expression}`, error);
                    return ''; // 返回空字符串以避免中断
                }
            });
        }

        // 匹配直接调用的 faker 方法，例如 "faker.name.firstName()"
        const match = customFaker.match(/^faker\.([\w.]+)\((.*)\)$/);
        if (match) {
            const methodPath = match[1].split('.'); // 分割方法路径
            const argsString = match[2]; // 提取参数字符串
            let method = faker;

            // 遍历路径，找到对应的 faker 方法
            for (const key of methodPath) {
                method = method[key];
                if (!method) {
                    throw new Error(`无效的 faker 方法路径: ${customFaker}`);
                }
            }

            // 解析参数字符串为实际参数
            const args = argsString ? JSON.parse(`[${argsString}]`) : []; // 将参数字符串解析为数组

            // 确保方法是可调用的函数
            if (typeof method === 'function') {
                return (method as (...args: any[]) => string)(...args); // 调用 faker 方法并传递参数
            }
        }

        throw new Error(`无效的 faker 方法格式: ${customFaker}`);
    } catch (error) {
        console.error(`执行自定义 faker 方法失败: ${error.message}`);
        return ''; // 返回空字符串以避免中断
    }
}