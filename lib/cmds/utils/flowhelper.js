/*
 * Copyright 2013 Elad Elrom, All Rights Reserved.
 *
 * @author @EladElrom
 */

generateConfigInitValues = function (result) {
    result.productionReleaseBranchName = (result.productionReleaseBranchName === '') ? 'master' : result.productionReleaseBranchName;
    result.nextReleaseBranchName = (result.nextReleaseBranchName === '') ? 'develop' : result.nextReleaseBranchName;
    result.feature = (result.feature === '') ? 'feature' : result.feature;
    result.release = (result.release === '') ? 'release' : result.release;
    result.hotfix = (result.hotfix === '') ? 'hotfix' : result.hotfix;
    result.support = (result.support === '') ? 'support' : result.support;
    result.tags = (result.tags === '') ? 'tags' : result.tags;

    return '[gitflow "branch"]\n' +
        '	master = ' + result.productionReleaseBranchName+'\n' +
        '	develop = '+result.nextReleaseBranchName+'\n' +
        '[gitflow "prefix"]\n' +
        '	feature = '+result.feature+'/\n' +
        '	release = '+result.release+'/\n' +
        '	hotfix = '+result.hotfix+'/\n' +
        '	support = '+result.support+'/\n' +
    '	versiontag =\n';
};

initPromptValues = function(options) {
    return [
        {
            name: 'productionReleaseBranchName',
            message: 'Branch name for production releases '+isBranchExistsElseEmpty('master',options,'[',']'),
            empty: true
        },
        {
            name: 'nextReleaseBranchName',
            message: 'Branch name for "next release" development ' + isBranchExistsElseEmpty('develop',options,'[',']'),
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
    var retMsg = options.branches.hasOwnProperty(branch) ? addBefore+branch+addAfter : addBefore+branch+' not available'+addAfter;
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