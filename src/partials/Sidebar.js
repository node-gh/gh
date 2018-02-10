'use strict';

import Component from 'metal-component';
import Soy from 'metal-soy';
import Toggler from 'metal-toggler';

import templates from './Sidebar.soy';

class Sidebar extends Component {
	attached() {
		this._toggler = new Toggler({
			content: '.sidebar-toggler-content',
			header: '.sidebar-header'
		});
	}

	disposed() {
		this._toggler.dispose();
	}
};

Soy.register(Sidebar, templates);

export default Sidebar;
