package business.controllers;

import business.models.ContactData;
import business.models.User;
import business.models.UserRepository;
import business.representation.ProfileRepresentation;
import business.security.UserAuthenticationToken;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
public class ProfileController {
    @Autowired
    private UserRepository userRepo;

    @RequestMapping(value = "/profile", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ProfileRepresentation getOwnProfile(UserAuthenticationToken user) {
        // Query user's profile
        LogFactory.getLog(this.getClass()).info("GET profile for user with id " + user.getId());

        // Return the representation
        return new ProfileRepresentation(userRepo.findOne(user.getId()));
    }

    @RequestMapping(value = "/profile", method = RequestMethod.PUT)
    public void putOwnProfile(UserAuthenticationToken user, @RequestBody ProfileRepresentation form) {
        LogFactory.getLog(this.getClass()).info("PUT profile for user with id " + user.getId());

        if (form == null) {
            LogFactory.getLog(this.getClass()).info("form is null!");
            return;
        }

        // LATER: Validate data (password requirements, no html tags, etc)

        // Get user
        User currentUser = userRepo.getOne(user.getId());

        // Update
        ContactData cData = currentUser.getContactData();

        if (cData == null) {
            cData = new ContactData();
            currentUser.setContactData(cData);
        }

        // Only update the telephone number
        ContactData modifiedData = form.getContactData();
        if (modifiedData == null) {
            LogFactory.getLog(this.getClass()).info("new contact data is null!");
        } else {
            cData.setTelephone(modifiedData.getTelephone());
        }

        // Save
        userRepo.save(currentUser);

        // FIXME probably we should return an error message in case validation fails
    }
}