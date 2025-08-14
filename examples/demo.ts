import { getConfig } from '../src/index.js'

// 示例：如何在实际项目中使用

const demo = async () => {
    try {
        console.log('🚀 1Password 配置工具演示\n')

        // 1. 获取 OSS 配置
        console.log('📁 获取 OSS 配置...')
        const ossConfig = await getConfig('your_1password_item_name_or_uuid', {
            region: 'OSS 区域配置',
            access_key_id: {
                key: 'username',
                description: 'OSS 访问密钥 ID'
            },
            access_key_secret: {
                key: 'credential',
                description: 'OSS 访问密钥 Secret'
            },
            bucket: {
                description: '存储桶名称'
            },
            host: {
                description: 'OSS 服务主机'
            },
            cdn_host: {
                description: 'CDN 主机地址'
            }
        })

        console.log('✅ OSS 配置 (简化格式):', ossConfig)

        // 展示详细格式的用法
        console.log('\n📋 获取详细信息...')
        const ossConfigDetailed = await getConfig('your_1password_item_name_or_uuid', {
            region: 'OSS 区域配置',
            access_key_id: {
                key: 'username',
                description: 'OSS 访问密钥 ID'
            },
            access_key_secret: {
                key: 'credential',
                description: 'OSS 访问密钥 Secret'
            },
            bucket: {
                description: '存储桶名称'
            },
            host: {
                description: 'OSS 服务主机'
            },
            cdn_host: {
                description: 'CDN 主机地址'
            }
        }, { detailedResult: true })

        console.log('✅ OSS 配置 (详细格式):', ossConfigDetailed)
    } catch (error: any) {
        console.error('\n❌ 演示失败:', error.message)
        console.log('\n💡 解决方法:')
        console.log('1. 安装 1Password CLI: https://1password.com/downloads/command-line/')
        console.log('2. 登录: op signin')
        console.log('3. 在 1Password 中创建包含相应字段的项目')
        console.log('4. 将项目名称替换为您的实际项目名称')
    }
}

// 运行演示
demo()
