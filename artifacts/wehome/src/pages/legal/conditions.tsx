import { LegalPage, P, UL, H3, type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    id: "objet",
    title: "Objet",
    content: (
      <>
        <P>
          Les présentes Conditions Générales d'Utilisation (ci-après «&nbsp;CGU&nbsp;») régissent l'accès et l'utilisation du site <strong>wehome.ma</strong> (ci-après «&nbsp;la Plateforme&nbsp;»), édité par la société WeHome.
        </P>
        <P>
          La Plateforme est un service de mise en relation entre des personnes souhaitant acheter, louer, vendre ou faire estimer un bien immobilier au Maroc, et des agents immobiliers partenaires ou propriétaires particuliers.
        </P>
        <P>
          WeHome n'est pas partie aux transactions immobilières conclues entre les utilisateurs. La Plateforme constitue uniquement un service technique d'intermédiation et de présentation d'annonces.
        </P>
      </>
    ),
  },
  {
    id: "acceptation",
    title: "Acceptation des CGU",
    content: (
      <>
        <P>
          L'accès et l'utilisation de la Plateforme impliquent l'acceptation pleine, entière et sans réserve des présentes CGU. L'utilisateur reconnaît en avoir pris connaissance et s'engage à les respecter.
        </P>
        <P>
          WeHome se réserve le droit de modifier les CGU à tout moment. La version applicable est celle en vigueur à la date d'utilisation de la Plateforme. Toute modification substantielle sera notifiée aux utilisateurs disposant d'un compte par email.
        </P>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Définitions",
    content: (
      <>
        <UL>
          <li><strong>Utilisateur</strong>&nbsp;: toute personne physique ou morale accédant à la Plateforme.</li>
          <li><strong>Visiteur</strong>&nbsp;: utilisateur non inscrit consultant les annonces et services.</li>
          <li><strong>Agent partenaire</strong>&nbsp;: professionnel de l'immobilier ayant créé un compte sur la Plateforme pour publier des annonces et gérer ses leads.</li>
          <li><strong>Vendeur particulier</strong>&nbsp;: personne physique non professionnelle soumettant une annonce de vente ou de location de son propre bien via le formulaire&nbsp;/publier.</li>
          <li><strong>Annonce</strong>&nbsp;: ensemble d'informations (texte, photos, prix, localisation) relatives à un bien immobilier publié sur la Plateforme.</li>
          <li><strong>Lead</strong>&nbsp;: demande de contact ou de visite émise par un visiteur intéressé par une annonce.</li>
        </UL>
      </>
    ),
  },
  {
    id: "services",
    title: "Services proposés",
    content: (
      <>
        <P>La Plateforme propose les services suivants&nbsp;:</P>
        <UL>
          <li>Consultation gratuite des annonces immobilières publiées;</li>
          <li>Recherche par filtres (ville, type, prix, surface, etc.) et sur carte;</li>
          <li>Soumission de demandes de contact ou de visite auprès des agents;</li>
          <li>Publication gratuite d'annonces pour les vendeurs particuliers (sous réserve de validation);</li>
          <li>Espace agent dédié pour la gestion d'annonces et de leads (sur inscription);</li>
          <li>Outils d'estimation et de calcul de financement;</li>
          <li>Sauvegarde de favoris et de recherches.</li>
        </UL>
        <P>
          WeHome se réserve le droit de modifier, suspendre ou supprimer tout ou partie des services à tout moment, sans préavis ni indemnité.
        </P>
      </>
    ),
  },
  {
    id: "inscription",
    title: "Inscription et compte",
    content: (
      <>
        <H3>Création de compte</H3>
        <P>
          La création d'un compte est nécessaire pour accéder à l'espace agent (<a href="/espace-agent" className="text-primary font-semibold hover:underline">/espace-agent</a>) et bénéficier de fonctionnalités étendues. Elle est gratuite.
        </P>
        <P>L'utilisateur s'engage à&nbsp;:</P>
        <UL>
          <li>fournir des informations exactes, complètes et à jour;</li>
          <li>conserver la confidentialité de ses identifiants de connexion;</li>
          <li>informer WeHome sans délai en cas d'utilisation non autorisée de son compte;</li>
          <li>ne créer qu'un seul compte par personne ou entité.</li>
        </UL>
        <H3>Suppression de compte</H3>
        <P>
          L'utilisateur peut demander la suppression de son compte à tout moment en écrivant à <a href="mailto:contact@wehome.ma" className="text-primary font-semibold hover:underline">contact@wehome.ma</a>. WeHome peut également suspendre ou supprimer un compte en cas de manquement aux présentes CGU, sans préavis ni indemnité.
        </P>
      </>
    ),
  },
  {
    id: "annonces",
    title: "Publication d'annonces",
    content: (
      <>
        <H3>Responsabilité du publicateur</H3>
        <P>
          L'agent ou le vendeur particulier qui publie une annonce est seul responsable du contenu qu'il diffuse. Il garantit&nbsp;:
        </P>
        <UL>
          <li>l'exactitude des informations (prix, surface, situation juridique du bien);</li>
          <li>la détention des droits sur les photos et descriptions;</li>
          <li>l'absence de double-publication frauduleuse;</li>
          <li>le respect des lois marocaines en vigueur (notamment fiscales et de copropriété);</li>
          <li>la disponibilité réelle du bien à la date de publication.</li>
        </UL>
        <H3>Validation par WeHome</H3>
        <P>
          Chaque annonce est soumise à une <strong>modération préalable</strong> par l'équipe WeHome. Cette validation, généralement sous 24 heures ouvrées, ne constitue pas une garantie de l'exactitude du contenu. WeHome se réserve le droit de refuser, modifier ou supprimer toute annonce, sans avoir à se justifier, notamment en cas de&nbsp;:
        </P>
        <UL>
          <li>informations manifestement erronées, incomplètes ou trompeuses;</li>
          <li>photos de mauvaise qualité ou non représentatives;</li>
          <li>prix manifestement abusif ou hors marché;</li>
          <li>contenu illégal, discriminatoire ou contraire aux bonnes mœurs;</li>
          <li>suspicion de fraude ou de spam.</li>
        </UL>
      </>
    ),
  },
  {
    id: "obligations-utilisateurs",
    title: "Obligations des utilisateurs",
    content: (
      <>
        <P>L'utilisateur s'engage à utiliser la Plateforme conformément à sa destination et à ne pas&nbsp;:</P>
        <UL>
          <li>diffuser des contenus illégaux, diffamatoires, racistes, discriminatoires ou portant atteinte à la vie privée d'autrui;</li>
          <li>publier des annonces frauduleuses, fictives ou trompeuses;</li>
          <li>collecter ou aspirer (scraper) les données de la Plateforme à des fins commerciales;</li>
          <li>tenter d'accéder de manière non autorisée à la Plateforme, à ses serveurs ou à des comptes tiers;</li>
          <li>introduire des virus, chevaux de Troie ou tout code malveillant;</li>
          <li>contourner les mesures techniques de protection mises en place.</li>
        </UL>
        <P>Tout manquement peut entraîner la suspension immédiate du compte, sans préjudice de poursuites judiciaires.</P>
      </>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    content: (
      <>
        <P>
          WeHome agit en qualité de tiers facilitateur. Elle n'est pas partie aux transactions immobilières et ne saurait être tenue responsable&nbsp;:
        </P>
        <UL>
          <li>de l'inexactitude des informations publiées par les utilisateurs;</li>
          <li>de la qualité, de la conformité ou de l'état réel des biens proposés;</li>
          <li>du déroulement, de la conclusion ou de l'échec d'une transaction entre utilisateurs;</li>
          <li>des litiges personnels survenant entre acheteurs, vendeurs et agents;</li>
          <li>de tout dommage indirect (perte de chance, manque à gagner, atteinte à l'image).</li>
        </UL>
        <P>
          WeHome met tout en œuvre pour assurer la disponibilité, la sécurité et le bon fonctionnement de la Plateforme. Toutefois, elle ne peut garantir une disponibilité ininterrompue et se réserve le droit de procéder à des interruptions pour maintenance.
        </P>
      </>
    ),
  },
  {
    id: "donnees-cookies",
    title: "Données personnelles et cookies",
    content: (
      <>
        <P>
          Le traitement des données personnelles est détaillé dans notre&nbsp;
          <a href="/confidentialite" className="text-primary font-semibold hover:underline">Politique de confidentialité</a>. L'utilisation des cookies est encadrée par notre&nbsp;
          <a href="/cookies" className="text-primary font-semibold hover:underline">Politique des cookies</a>.
        </P>
      </>
    ),
  },
  {
    id: "propriete-intellectuelle",
    title: "Propriété intellectuelle",
    content: (
      <>
        <P>
          L'ensemble des éléments composant la Plateforme (textes, logos, photos, design, code source, base de données) est protégé par la loi marocaine n° 2-00 sur les droits d'auteur. Toute reproduction sans autorisation préalable est interdite.
        </P>
        <P>
          En publiant une annonce, l'utilisateur concède à WeHome une licence non exclusive, gratuite et mondiale de reproduction et de représentation de son contenu, pour la durée de publication de l'annonce et exclusivement aux fins de promotion sur la Plateforme et ses canaux de communication (réseaux sociaux, newsletters, partenaires).
        </P>
      </>
    ),
  },
  {
    id: "droit-applicable",
    title: "Droit applicable et résolution des litiges",
    content: (
      <>
        <P>
          Les présentes CGU sont régies par le <strong>droit marocain</strong>. Les parties s'efforceront de résoudre tout différend à l'amiable.
        </P>
        <P>
          À défaut, et nonobstant toute clause contraire, les <strong>tribunaux compétents de Casablanca</strong> seront seuls compétents, sauf disposition d'ordre public prévoyant une autre juridiction.
        </P>
      </>
    ),
  },
];

import { useTranslation } from "react-i18next";

export default function ConditionsPage() {
  const { t } = useTranslation();
  return (
    <LegalPage
      title={t("legal.conditions_title")}
      subtitle={t("legal.conditions_subtitle")}
      lastUpdated="13 mai 2026"
      sections={SECTIONS}
    />
  );
}
