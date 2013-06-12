/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * @author @EladElrom
 */

generateConfigInitValues = function (result) {
    var retVal = '';
    result.productionReleaseBranchName = (result.productionReleaseBranchName === '') ? 'master' : result.productionReleaseBranchName;
    result.nextReleaseBranchName = (result.nextReleaseBranchName === '') ? 'develop' : result.nextReleaseBranchName;
    result.feature = (result.feature === '') ? 'feature' : result.feature;
    result.release = (result.release === '') ? 'release' : result.release;
    result.hotfix = (result.hotfix === '') ? 'hotfix' : result.hotfix;
    result.support = (result.support === '') ? 'support' : result.support;
    result.tags = (result.tags === '') ? 'tags' : result.tags;

    retVal = '[gitflow "branch"]\n';
    retVal += '	master = '+result.productionReleaseBranchName+'\n';
    retVal += '	develop = '+result.nextReleaseBranchName+'\n';
    retVal += '[gitflow "prefix"]\n';
    retVal += '	feature = '+result.feature+'/\n';
    retVal += '	release = '+result.release+'/\n';
    retVal += '	hotfix = '+result.hotfix+'/\n';
    retVal += '	support = '+result.support+'/\n';
    retVal += '	versiontag =\n';

    return retVal;
};

initPromptValues = function(options) {
    return [
        {
            name: 'productionReleaseBranchName',
            message:
                'Which branch should be used for production releases?' + '\n' +
                    isBranchExistsElseEmpty('master',options, '- ','\n') +
                'Branch name for production releases '+isBranchExistsElseEmpty('master',options,'[',']'),
            empty: true
        },
        {
            name: 'nextReleaseBranchName',
            message:
                'Which branch should be used for integration of the "next release"?' + '\n' +
                    isBranchExistsElseEmpty('develop',options, '- ','\n') +
                    'Branch name for "next release" development ' + isBranchExistsElseEmpty('develop',options,'[',']'),
            empty: true
        },
        {
            name: 'branchPrefixes',
            message:
                'How to name your supporting branch prefixes?',
            empty: true
        },
        {
            name: 'feature',
            message:
                'Feature branches? [feature/]',
            empty: true
        },
        {
            name: 'release',
            message:
                'Release branches? [release/]',
            empty: true
        },
        {
            name: 'hotfix',
            message:
                'Hotfix branches? [hotfix/]',
            empty: true
        },
        {
            name: 'support',
            message:
                'Support branches? [support/]',
            empty: true
        },
        {
            name: 'tags',
            message:
                'Version tag prefix? []',
            empty: true
        }
    ];
};

function isBranchExistsElseEmpty(branch,options,addBefore,addAfter) {
    var retMsg = options.branches.hasOwnProperty(branch) ? addBefore+branch+addAfter : '';
    return retMsg;
}

listBranches = function(options) {
    var branches = [];
    for(var name in options.branches) {
        if (name != '*' && name !== '')
            branches.push({'name': name});
    }
    return branches;
};

sortBranchesByPrefix = function(options,prefix) {
    var branches = [];
    for(var name in options.branches) {
        if (name != '*' && name !== '' && name.indexOf(prefix) !== -1)
            branches.push({'name': name});
    }
    return branches;
};

if (typeof exports != 'undefined' ) {
    exports.generateConfigInitValues = generateConfigInitValues;
    exports.initPromptValues = initPromptValues;
    exports.listBranches = listBranches;
    exports.sortBranchesByPrefix = sortBranchesByPrefix;
}