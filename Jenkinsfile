def params = [
    app_service: 'settlement-ms',
    cluster_suffix: '-settlement',
    cluster_key: [
        development: '-3lbyo',
        qa: '-jqybe',
        production: '-x5q54'
    ]
]
@Library('shared-library@feature/experimental')_
deployNpmMain("https://bitbucket.org/grupovanti/settlement-ms.git", "058264065446", params)
