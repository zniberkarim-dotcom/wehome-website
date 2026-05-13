import { LegalPage, P, UL, H3, Todo, type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS: LegalSection[] = [
  {
    id: "preambule",
    title: "Préambule",
    content: (
      <>
        <P>
          La présente politique de confidentialité décrit la manière dont <strong>WeHome</strong> (ci-après «&nbsp;nous&nbsp;») collecte, utilise et protège vos données personnelles lorsque vous utilisez le site <strong>wehome.ma</strong>.
        </P>
        <P>
          Nous nous engageons à respecter votre vie privée et à traiter vos données conformément à la <strong>loi n° 09-08</strong> du 18 février 2009 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, ainsi qu'aux délibérations et recommandations de la <strong>CNDP</strong>.
        </P>
      </>
    ),
  },
  {
    id: "responsable",
    title: "Responsable du traitement",
    content: (
      <>
        <P>Le responsable du traitement des données personnelles collectées sur la Plateforme est&nbsp;:</P>
        <UL>
          <li>Raison sociale&nbsp;: <Todo>raison sociale exacte</Todo></li>
          <li>Siège social&nbsp;: <Todo>adresse complète à Casablanca</Todo></li>
          <li>Représentant légal&nbsp;: Karim Zniber, Directeur Général</li>
          <li>Email&nbsp;: <a href="mailto:contact@wehome.ma" className="text-primary font-semibold hover:underline">contact@wehome.ma</a></li>
          <li>Email dédié à la protection des données&nbsp;: <a href="mailto:privacy@wehome.ma" className="text-primary font-semibold hover:underline">privacy@wehome.ma</a></li>
        </UL>
        <P>
          Les traitements ont fait l'objet d'une déclaration auprès de la CNDP sous le numéro&nbsp;<Todo>numéro de déclaration CNDP</Todo>.
        </P>
      </>
    ),
  },
  {
    id: "donnees-collectees",
    title: "Données collectées",
    content: (
      <>
        <P>Selon votre interaction avec la Plateforme, nous pouvons collecter les catégories de données suivantes&nbsp;:</P>
        <H3>Données fournies directement</H3>
        <UL>
          <li><strong>Identité</strong>&nbsp;: nom, prénom (et le cas échéant raison sociale pour les agents/agences);</li>
          <li><strong>Coordonnées</strong>&nbsp;: adresse email, numéro de téléphone, adresse postale;</li>
          <li><strong>Compte agent</strong>&nbsp;: photo de profil, biographie, zones d'activité, logo d'agence;</li>
          <li><strong>Annonces immobilières</strong>&nbsp;: descriptions, photos, prix, adresse du bien, caractéristiques;</li>
          <li><strong>Demandes</strong>&nbsp;: messages envoyés via les formulaires de contact, de visite ou d'estimation;</li>
          <li><strong>Préférences</strong>&nbsp;: favoris, recherches sauvegardées, biens consultés.</li>
        </UL>
        <H3>Données collectées automatiquement</H3>
        <UL>
          <li><strong>Données techniques</strong>&nbsp;: adresse IP, type de navigateur, système d'exploitation, dates et heures de visite;</li>
          <li><strong>Données de navigation</strong>&nbsp;: pages visitées, durée de session, parcours, source d'arrivée;</li>
          <li><strong>Cookies et identifiants similaires</strong>&nbsp;: voir notre <a href="/cookies" className="text-primary font-semibold hover:underline">Politique des cookies</a>.</li>
        </UL>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Finalités et bases légales",
    content: (
      <>
        <P>Vos données sont traitées pour les finalités suivantes&nbsp;:</P>
        <UL>
          <li><strong>Mise en relation acheteur/locataire avec un agent ou un vendeur</strong> — base&nbsp;: exécution du contrat de service;</li>
          <li><strong>Publication, modération et diffusion des annonces</strong> — base&nbsp;: exécution du contrat;</li>
          <li><strong>Gestion des comptes et de l'espace agent</strong> — base&nbsp;: exécution du contrat;</li>
          <li><strong>Réponse à vos demandes et support utilisateur</strong> — base&nbsp;: intérêt légitime;</li>
          <li><strong>Envoi d'informations commerciales (newsletter, alertes immobilières)</strong> — base&nbsp;: consentement préalable, révocable à tout moment;</li>
          <li><strong>Amélioration de la Plateforme et statistiques anonymisées</strong> — base&nbsp;: intérêt légitime;</li>
          <li><strong>Lutte contre la fraude et les abus</strong> — base&nbsp;: intérêt légitime et obligations légales;</li>
          <li><strong>Respect des obligations légales et comptables</strong> — base&nbsp;: obligation légale.</li>
        </UL>
      </>
    ),
  },
  {
    id: "destinataires",
    title: "Destinataires des données",
    content: (
      <>
        <P>Vos données peuvent être partagées avec les destinataires suivants, strictement dans la limite des finalités ci-dessus&nbsp;:</P>
        <UL>
          <li><strong>Équipe interne de WeHome</strong> habilitée (commerciaux, modération, support);</li>
          <li><strong>Agent partenaire</strong> rattaché à un bien lorsque vous demandez à le contacter ou à le rencontrer;</li>
          <li><strong>Prestataires techniques</strong>, sous-traitants encadrés par contrat&nbsp;:
            <UL>
              <li><strong>Supabase Inc.</strong> — base de données et stockage (Singapour/Europe);</li>
              <li><strong>Vercel Inc.</strong> — hébergement web (États-Unis);</li>
              <li><strong>Google LLC</strong> — service Google Maps pour l'affichage cartographique (États-Unis);</li>
              <li><Todo>autres prestataires éventuels (Resend pour emails, analytics, etc.)</Todo></li>
            </UL>
          </li>
          <li><strong>Autorités administratives ou judiciaires</strong> sur demande légale dûment formalisée.</li>
        </UL>
        <P>
          Vos données ne sont <strong>jamais vendues ni louées</strong> à des tiers à des fins commerciales.
        </P>
      </>
    ),
  },
  {
    id: "transferts",
    title: "Transferts hors du Maroc",
    content: (
      <>
        <P>
          Certains de nos prestataires sont situés en dehors du Maroc, notamment aux États-Unis. Conformément à la <strong>loi 09-08</strong>, ces transferts sont encadrés par&nbsp;:
        </P>
        <UL>
          <li>Des clauses contractuelles types garantissant un niveau de protection adéquat;</li>
          <li>L'autorisation préalable de la CNDP lorsqu'elle est requise;</li>
          <li>L'application des engagements de sécurité de chaque prestataire (chiffrement en transit et au repos, contrôle d'accès, audits réguliers).</li>
        </UL>
      </>
    ),
  },
  {
    id: "duree",
    title: "Durée de conservation",
    content: (
      <>
        <P>Vos données sont conservées pour la durée strictement nécessaire aux finalités du traitement&nbsp;:</P>
        <UL>
          <li><strong>Compte utilisateur</strong>&nbsp;: pendant toute la durée de la relation contractuelle, puis 3 ans après la dernière activité à des fins de prospection commerciale (sauf opposition);</li>
          <li><strong>Annonces publiées</strong>&nbsp;: jusqu'à 12 mois après leur dépublication, pour archivage et statistiques anonymisées;</li>
          <li><strong>Leads et demandes de contact</strong>&nbsp;: 3 ans à compter du dernier contact;</li>
          <li><strong>Données de facturation</strong>&nbsp;: 10 ans en application des obligations comptables et fiscales marocaines;</li>
          <li><strong>Cookies analytiques</strong>&nbsp;: maximum 13 mois;</li>
          <li><strong>Logs techniques</strong>&nbsp;: 12 mois à des fins de sécurité.</li>
        </UL>
        <P>Passés ces délais, vos données sont supprimées ou anonymisées de manière irréversible.</P>
      </>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    content: (
      <>
        <P>Conformément à la loi 09-08, vous disposez à tout moment des droits suivants&nbsp;:</P>
        <UL>
          <li><strong>Droit d'accès</strong>&nbsp;: obtenir la confirmation que vos données sont traitées et en recevoir une copie;</li>
          <li><strong>Droit de rectification</strong>&nbsp;: corriger toute information inexacte ou incomplète;</li>
          <li><strong>Droit d'opposition</strong>&nbsp;: vous opposer au traitement pour motif légitime, ou à la prospection commerciale sans justification;</li>
          <li><strong>Droit de suppression</strong>&nbsp;: demander l'effacement de vos données, sous réserve des obligations légales de conservation;</li>
          <li><strong>Droit au retrait du consentement</strong>&nbsp;: pour les traitements fondés sur le consentement (newsletter, alertes).</li>
        </UL>
        <P>
          Pour exercer ces droits, contactez-nous à&nbsp;
          <a href="mailto:privacy@wehome.ma" className="text-primary font-semibold hover:underline">privacy@wehome.ma</a>&nbsp;en joignant une copie d'une pièce d'identité. Nous répondons sous un délai maximum de <strong>30 jours</strong>.
        </P>
        <H3>Recours auprès de la CNDP</H3>
        <P>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel (CNDP)&nbsp;: <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">www.cndp.ma</a>.
        </P>
      </>
    ),
  },
  {
    id: "securite",
    title: "Sécurité",
    content: (
      <>
        <P>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé, la divulgation ou la modification, notamment&nbsp;:</P>
        <UL>
          <li>chiffrement des données en transit (HTTPS/TLS) et au repos;</li>
          <li>authentification forte et gestion des habilitations selon le principe du moindre privilège;</li>
          <li>sauvegardes régulières et redondance des bases de données;</li>
          <li>journalisation des accès et détection des comportements anormaux;</li>
          <li>formation interne à la protection des données et audits périodiques.</li>
        </UL>
        <P>
          Malgré ces précautions, aucun système n'étant infaillible, nous nous engageons à vous notifier dans les meilleurs délais en cas de violation susceptible de porter atteinte à vos droits.
        </P>
      </>
    ),
  },
  {
    id: "mineurs",
    title: "Mineurs",
    content: (
      <>
        <P>
          La Plateforme n'est pas destinée aux personnes mineures de moins de 18 ans. Nous ne collectons pas sciemment de données de personnes mineures. Si vous estimez qu'un mineur nous a transmis des données, contactez-nous à <a href="mailto:privacy@wehome.ma" className="text-primary font-semibold hover:underline">privacy@wehome.ma</a> et nous procéderons à leur suppression immédiate.
        </P>
      </>
    ),
  },
  {
    id: "modifications",
    title: "Modifications de la politique",
    content: (
      <>
        <P>
          Cette politique peut évoluer pour refléter les changements de nos pratiques ou de la réglementation. La version applicable est celle publiée sur la Plateforme à la date de votre visite. En cas de modification substantielle, les utilisateurs disposant d'un compte seront informés par email.
        </P>
      </>
    ),
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="Cette politique décrit comment WeHome collecte, utilise et protège vos données personnelles, conformément à la loi n° 09-08 et aux recommandations de la CNDP."
      lastUpdated="13 mai 2026"
      sections={SECTIONS}
    />
  );
}
