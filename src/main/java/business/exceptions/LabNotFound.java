/**
 * Copyright (C) 2016  Stichting PALGA
 * This file is distributed under the GNU Affero General Public License
 * (see accompanying file <a href="{@docRoot}/LICENSE">LICENSE</a>).
 */
package business.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.NOT_FOUND)  // 
public class LabNotFound extends RuntimeException {
    public LabNotFound() {
        super("Lab cannot be found.");
    }
    
    public LabNotFound(String message) {
        super(message);
    }
}