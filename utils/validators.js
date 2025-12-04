export function validateFolderName(name) {
    if(typeof name !== 'string') {
        return { valid: false, error: 'Folder name must be string'};
    }

    name = name.trim();

    if(!name) {
        return { valid: false, error: "Folder name is required" };
    }

    if (name.length < 2) {
        return { valid: false, error: "Folder name must be at least 2 characters" };
    }
    
    if (name.length > 255) {
        return { valid: false, error: "Folder name cannot exceed 255 characters" };
    }

     if (isReservedName(name)) {
        return { valid: false, error: `"${name}" is a reserved name` };
    }

    const illegalChars = /[\\/:\*\?"<>\|\x00-\x1f]/;
    if (illegalChars.test(name)) {
        return { 
            valid: false, 
            error: "Folder name cannot contain: \\ / : * ? \" < > | or control characters" 
        };
    }

    if (name === '..' || name === '.') {
        return { valid: false, error: "Folder name cannot be '.' or '..'" };
    }

    if (name.startsWith('.') || name.endsWith('.') || 
        name.startsWith(' ') || name.endsWith(' ')) {
        return { 
            valid: false, 
            error: "Folder name cannot start or end with spaces or dots" 
        };
    }

    if (name.includes('..')) {
        return { valid: false, error: "Folder name cannot contain '..'" };
    }

    return { 
        valid: true, 
        name: name,
        sanitized: name.replace(/\s+/g, ' ').trim()
    };
}