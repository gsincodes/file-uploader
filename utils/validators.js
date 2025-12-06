// Reserved names that cannot be used as folder names (Windows/Unix)
const RESERVED_NAMES = [
    'con', 'prn', 'aux', 'nul',
    'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
    'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
    '.git', '.env', 'node_modules'
];

function isReservedName(name) {
    return RESERVED_NAMES.includes(name.toLowerCase());
}

export function validateFolderName(name) {
    if(typeof name !== 'string') {
        return { 
            valid: false, 
            error: 'Folder name must be a string'
        };
    }

    const trimmedName = name.trim();

    if(!trimmedName) {
        return { 
            valid: false, 
            error: "Folder name is required" 
        };
    }

    if (trimmedName.length < 2) {
        return { 
            valid: false, 
            error: "Folder name must be at least 2 characters" 
        };
    }
    
    if (trimmedName.length > 255) {
        return { 
            valid: false, 
            error: "Folder name cannot exceed 255 characters" 
        };
    }

    if (isReservedName(trimmedName)) {
        return { 
            valid: false, 
            error: `"${trimmedName}" is a reserved name` 
        };
    }

    // Illegal characters: \ / : * ? " < > | and control characters
    const illegalChars = /[\\/:\*\?"<>\|\x00-\x1f]/;
    if (illegalChars.test(trimmedName)) {
        return { 
            valid: false, 
            error: "Folder name cannot contain: \\ / : * ? \" < > | or control characters" 
        };
    }

    if (trimmedName === '..' || trimmedName === '.') {
        return { 
            valid: false, 
            error: "Folder name cannot be '.' or '..'" 
        };
    }

    if (trimmedName.startsWith('.') || trimmedName.endsWith('.') || 
        trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
        return { 
            valid: false, 
            error: "Folder name cannot start or end with spaces or dots" 
        };
    }

    if (trimmedName.includes('..')) {
        return { 
            valid: false, 
            error: "Folder name cannot contain '..'" 
        };
    }

    // Sanitize: collapse multiple spaces into one
    const sanitized = trimmedName.replace(/\s+/g, ' ');

    return { 
        valid: true, 
        sanitized: sanitized
    };
}

export function isReservedNameExport(name) {
    return isReservedName(name);
}