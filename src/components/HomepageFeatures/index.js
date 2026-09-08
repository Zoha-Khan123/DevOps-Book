import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '📁 Git & GitHub Mastery',
    description: (
      <>
        Version control ka Time Machine concept, commits, branches, merge conflicts aur standard Pull Request (PR) workflow Roman Urdu mein.
      </>
    ),
    link: '/docs/git-and-github-fundamentals',
    btnText: 'Explore Git & GitHub',
  },
  {
    title: '🔄 CI/CD & Actions YAML',
    description: (
      <>
        Continuous Integration aur Deployment ka step-by-step flow, runner setup, automated testing aur YAML workflow ka line-by-line breakdown.
      </>
    ),
    link: '/docs/github-actions-yaml-deep-dive',
    btnText: 'Decode Actions YAML',
  },
  {
    title: '🔐 SSH & Automated Deploy',
    description: (
      <>
        Lock & Key security model, <code>ssh-keygen</code>, <code>authorized_keys</code>, GitHub Secrets aur <code>rsync -avz --delete</code> ke sath live server deployment.
      </>
    ),
    link: '/docs/ssh-key-setup-and-server-deployment',
    btnText: 'Learn SSH Deployment',
  },
  {
    title: '📑 Complete DevOps Cheat Sheet',
    description: (
      <>
        Tamam essential Git commands, GitHub CLI (<code>gh</code>), SSH config profiles, Docker pipelines aur production YAML templates ki master reference list.
      </>
    ),
    link: '/docs/git-and-github-commands-cheatsheet',
    btnText: 'View Master Cheat Sheet',
  },
];

function Feature({title, description, link, btnText}) {
  return (
    <div className={clsx('col col--6', 'margin-bottom--lg')}>
      <div className="card shadow--md" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
        <div className="card__header">
          <Heading as="h3">{title}</Heading>
        </div>
        <div className="card__body" style={{flexGrow: 1}}>
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--block" to={link}>
            {btnText} ➔
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features} style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
