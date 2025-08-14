# 1password-config

A secure Node.js toolkit for retrieving configurations from 1Password.

## 🚀 Quick Start

```bash
# Install
npm install 1password-config

# Create a configuration item in 1Password, then:
```

```typescript
import { getConfig } from '1password-config';

// Example: Alibaba Cloud OSS Configuration
const ossConfig = await getConfig('your-1password-item-uuid-or-name', {
  region: 'OSS region configuration',
  access_key_id: {
    key: 'username',
    description: 'OSS Access Key ID'
  },
  access_key_secret: {
    key: 'credential',
    description: 'OSS Access Key Secret'
  },
  bucket: {
    description: 'Storage bucket name'
  },
  host: {
    description: 'OSS service host'
  }
});

// Use directly - it's that simple!
console.log('Region:', ossConfig.region);
console.log('Access Key:', ossConfig.access_key_id);
```

## 📖 API Reference

### Function Signature

```typescript
// Simple format (default)
function getConfig<T extends ConfigMap>(
  idOrName: string,
  keyOptions: T,
  options?: { detailedResult?: false }
): Promise<{ [K in keyof T]: string | undefined }>

// Detailed format
function getConfig<T extends ConfigMap>(
  idOrName: string,
  keyOptions: T,
  options: { detailedResult: true }
): Promise<{ [K in keyof T]: ConfigResult }>
```

### Parameters

#### `idOrName: string`
The name or UUID of the 1Password item.

#### `keyOptions: ConfigMap`
Configuration field mapping object. Supports two formats:

**1. String value format:**
```typescript
{
  username: 'User name description'
}
```

**2. Object value format:**
```typescript
{
  access_key: {
    key: 'username',           // Field name in 1Password (optional, defaults to key name)
    default: 'default_value',  // Default value (optional)
    description: 'Access key'  // Description (optional)
  }
}
```

#### `options?: GetConfigOptions`
Configuration options object:
- `detailedResult?: boolean` - Whether to return detailed format, default `false`

### Return Types

#### Simple Format (Default)
Returns an object with configuration values:

```typescript
{
  region: "oss-cn-shanghai",
  access_key_id: "DSAI5aOitshaSH6PsagdLtms",
  bucket: "my-bucket"
}
```

#### Detailed Format
Returns an object with complete information for each field:

```typescript
{
  region: {
    value: "oss-cn-shanghai",
    matched: true,
    description: "OSS region configuration"
  },
  access_key_id: {
    value: "DSAI5aOitshaSH6PsagdLtms",
    matched: true,
    description: "OSS Access Key ID"
  },
  backup_key: {
    value: "default-backup-key",
    matched: false,
    description: "Backup key"
  }
}
```

#### ConfigResult Type
```typescript
type ConfigResult = {
    value: string | undefined;  // Field value
    matched: boolean;           // Whether found in 1Password
    description?: string;       // Description
}
```

## 💡 Usage Examples

### Simple Configuration (Recommended)

Most common usage - directly get configuration values:

```typescript
const config = await getConfig('my-oss-config', {
  region: 'OSS region',
  access_key_id: {
    key: 'username',
    default: 'dev-key'
  },
  bucket: { default: 'dev-bucket' }
});

// Use directly
const ossClient = new OSS({
  region: config.region,
  accessKeyId: config.access_key_id,
  bucket: config.bucket
});
```

### Advanced Configuration

When 1Password field names differ from your desired names:

```typescript
const config = await getConfig('oss-credentials', {
  accessKey: {
    key: 'username',        // Maps to 'username' field in 1Password
    description: 'Access key'
  },
  secretKey: {
    key: 'credential',      // Maps to 'credential' field in 1Password
    default: 'dev-secret'   // Development environment default
  }
});
```

### Detailed Information Mode

When you need to know if configuration was actually retrieved from 1Password:

```typescript
const config = await getConfig('my-config', {
  database_url: 'Database connection string',
  api_key: { default: 'dev-key' }
}, { detailedResult: true });  // Enable detailed mode

// Check configuration status
console.log('Database URL:', config.database_url.value);
console.log('From 1Password:', config.database_url.matched ? 'Yes' : 'No');

if (!config.api_key.matched) {
    console.warn('⚠️ API key using default value, please configure in 1Password');
}
```

## 🛠️ Setting up 1Password

1. Open 1Password app
2. Create a new "Secure Note" or "API Credential"
3. Name it something like "My OSS Config"
4. Add fields:
   - `username` - Your access key ID
   - `credential` - Your access key secret
   - `region` - OSS region (e.g., oss-cn-shanghai)
   - `bucket` - Bucket name
   - `host` - OSS endpoint URL
   - `cdn_host` - CDN URL
5. Save

Then in your code:

```typescript
const config = await getConfig('My OSS Config', {
  region: 'OSS region',
  access_key_id: {
    key: 'username',
    description: 'OSS Access Key ID'
  },
  access_key_secret: {
    key: 'credential',
    description: 'OSS Access Key Secret'
  },
  bucket: 'Storage bucket',
  host: 'OSS endpoint',
  cdn_host: 'CDN endpoint'
});
```

## 🌍 Environment-specific Configuration

```typescript
// Use different configurations for different environments
const itemName = process.env.NODE_ENV === 'production' 
  ? 'Production OSS Config' 
  : 'Development OSS Config';

const config = await getConfig(itemName, {
  region: 'OSS region',
  access_key_id: { key: 'username' },
  access_key_secret: { key: 'credential' },
  bucket: { default: 'dev-bucket' }
});
```

## 🔍 Production Environment Validation

```typescript
if (process.env.NODE_ENV === 'production') {
    const config = await getConfig('Production Config', {
        database_url: 'Database URL',
        jwt_secret: 'JWT Secret',
        oss_key: 'OSS Access Key'
    }, { detailedResult: true });
    
    // Ensure critical configurations are set
    const missing = Object.entries(config)
        .filter(([, cfg]) => !cfg.matched)
        .map(([key]) => key);
    
    if (missing.length > 0) {
        throw new Error(`Missing production configurations: ${missing.join(', ')}`);
    }
}
```

## ❓ Troubleshooting

**Q: Item not found error?**
- Ensure the 1Password item name matches exactly
- Try using the item UUID: run `op item list` to view

**Q: Field not retrieving?**
- Check if field name is correct (case-insensitive)
- Confirm the field exists in 1Password

**Q: Need to re-login?**
- Run `op signin` to re-authenticate

## 📚 More Resources

- 📖 [Detailed API Documentation](./API.md) - Complete feature reference
- 💡 [Example Code](./examples/) - Practical examples
- 🚀 Run example: `npm run example`

## 📄 License

MIT
