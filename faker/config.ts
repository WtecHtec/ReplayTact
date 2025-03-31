import { executeCustomFaker } from '~faker';

export const fakerStrategies = {
    fakercode: {
        label: 'faker代码',
        desc: '输入 faker 代码，例如1: faker.number.int(5) 示例2: ${faker.helpers.arrayElement(["A", "B"])}-你好',
        argtype: 'string',
        generate: (faker, arg) => {
            try {
                return executeCustomFaker(faker, arg);
            } catch (error) {
                console.error('执行自定义 faker 方法失败:', error);
                return '';
            }
        },
    },
    // 数据类型模块
    number: {
        label: '随机数字',
        desc: '随机生成一个数字（默认范围 0-100）',
        generate: (faker, arg = [100]) => faker.number.int(...arg),
    },
    float: {
        label: '随机浮点数',
        desc: '随机生成一个浮点数（默认范围 0-100）',
        generate: (faker, arg = [100]) => faker.number.float(...arg),
    },
    boolean: {
        label: '随机布尔值',
        desc: '随机生成 true 或 false',
        generate: (faker) => faker.datatype.boolean(),
    },
    uuid: {
        label: 'UUID',
        desc: '随机生成一个 UUID',
        generate: (faker) => faker.string.uuid(),
    },

    // 名字模块
    firstName: {
        label: '名字',
        desc: '随机生成一个名字',
        generate: (faker) => faker.name.firstName(),
    },
    lastName: {
        label: '姓氏',
        desc: '随机生成一个姓氏',
        generate: (faker) => faker.name.lastName(),
    },
    fullName: {
        label: '全名',
        desc: '随机生成一个全名',
        generate: (faker) => faker.name.fullName(),
    },

    // 地址模块
    city: {
        label: '城市',
        desc: '随机生成一个城市名称',
        generate: (faker) => faker.location.city(),
    },
    country: {
        label: '国家',
        desc: '随机生成一个国家名称',
        generate: (faker) => faker.location.country(),
    },
    zipCode: {
        label: '邮政编码',
        desc: '随机生成一个邮政编码',
        generate: (faker) => faker.location.zipCode(),
    },
    streetAddress: {
        label: '街道地址',
        desc: '随机生成一个街道地址',
        generate: (faker) => faker.location.streetAddress(),
    },

    // 网络模块
    email: {
        label: '邮箱',
        desc: '随机生成一个邮箱地址',
        generate: (faker) => faker.internet.email(),
    },
    userName: {
        label: '用户名',
        desc: '随机生成一个用户名',
        generate: (faker) => faker.internet.userName(),
    },
    url: {
        label: 'URL',
        desc: '随机生成一个 URL',
        generate: (faker) => faker.internet.url(),
    },
    ip: {
        label: 'IP 地址',
        desc: '随机生成一个 IPv4 地址',
        generate: (faker) => faker.internet.ip(),
    },
    macAddress: {
        label: 'MAC 地址',
        desc: '随机生成一个 MAC 地址',
        generate: (faker) => faker.internet.mac(),
    },

    // 时间模块
    pastDate: {
        label: '过去的日期',
        desc: '随机生成一个过去的日期',
        generate: (faker, arg = [1]) => faker.date.past(...arg),
    },
    futureDate: {
        label: '未来的日期',
        desc: '随机生成一个未来的日期',
        generate: (faker, arg = [1]) => faker.date.future(...arg),
    },
    recentDate: {
        label: '最近的日期',
        desc: '随机生成一个最近的日期',
        generate: (faker, arg = [7]) => faker.date.recent(...arg),
    },

    // 金融模块
    creditCardNumber: {
        label: '信用卡号',
        desc: '随机生成一个信用卡号',
        generate: (faker) => faker.finance.creditCardNumber(),
    },
    currencyCode: {
        label: '货币代码',
        desc: '随机生成一个货币代码',
        generate: (faker) => faker.finance.currencyCode(),
    },
    accountNumber: {
        label: '银行账号',
        desc: '随机生成一个银行账号',
        generate: (faker) => faker.finance.accountNumber(),
    },

    // 公司模块
    companyName: {
        label: '公司名称',
        desc: '随机生成一个公司名称',
        generate: (faker) => faker.company.name(),
    },
    jobTitle: {
        label: '职位名称',
        desc: '随机生成一个职位名称',
        generate: (faker) => faker.person.jobTitle(),
    },

    // 其他模块
    arrayElement: {
        label: '数组随机元素',
        desc: '在值中随机选择，在下面的输入框中输入数组1,2,3,4(英文逗号分隔)',
        argtype: 'array',
        generate: (faker, arg) => faker.helpers.arrayElement(arg),
    },
    phoneNumber: {
        label: '电话号码',
        desc: '随机生成一个电话号码',
        generate: (faker) => faker.phone.number(),
    },
};