'use strict';

import Component from 'metal-component';
import Soy from 'metal-soy';

import templates from './SocialButtons.soy';

class SocialButtons extends Component {
    rendered() {
        this.siteUrl = window.location.origin;
    }
};

Soy.register(SocialButtons, templates);

export default SocialButtons;