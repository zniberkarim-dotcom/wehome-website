import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LegalPage, P, UL, H3, type LegalSection } from "@/components/legal/LegalPage";

function getSections(t: (key: string) => string): LegalSection[] {
  return [
    {
      id: "definition",
      title: t("legal.cookies_s1_title"),
      content: (
        <>
          <P>
            Un <strong>cookie</strong> est un petit fichier texte déposé sur votre terminal
            (ordinateur, smartphone, tablette) par le site internet que vous visitez. Il permet
            notamment de reconnaître votre navigateur lors de visites ultérieures, de mémoriser vos
            préférences, ou de mesurer la fréquentation du site.
          </P>
          <P>
            La présente politique s'applique également aux technologies similaires aux cookies
            (pixels, balises invisibles, <em>local storage</em>, <em>session storage</em>) utilisées
            par <strong>wehome.ma</strong>.
          </P>
        </>
      ),
    },
    {
      id: "categories",
      title: t("legal.cookies_s2_title"),
      content: (
        <>
          <H3>1. Cookies strictement nécessaires</H3>
          <P>
            Indispensables au fonctionnement de la Plateforme. Ils ne peuvent pas être désactivés.
            Sans eux, certains services ne peuvent pas être fournis.
          </P>
          <UL>
            <li>
              <strong>Authentification</strong> (Supabase)&nbsp;: maintien de la session de
              connexion pour les agents et utilisateurs inscrits;
            </li>
            <li>
              <strong>Sécurité</strong>&nbsp;: détection et prévention des activités frauduleuses;
            </li>
            <li>
              <strong>Préférences techniques</strong>&nbsp;: choix d'affichage (liste/carte sur la
              page des biens).
            </li>
          </UL>

          <H3>2. Cookies de préférences (et stockage local)</H3>
          <P>
            Permettent de mémoriser vos choix entre deux visites pour personnaliser votre
            expérience.
          </P>
          <UL>
            <li>
              <strong>Favoris</strong>&nbsp;: liste des biens marqués comme favoris (
              <code>localStorage</code>);
            </li>
            <li>
              <strong>Biens récemment consultés</strong>&nbsp;: historique de navigation sur les
              annonces;
            </li>
            <li>
              <strong>Filtres de recherche</strong>&nbsp;: rétention des derniers critères utilisés.
            </li>
          </UL>

          <H3>3. Cookies de mesure d'audience</H3>
          <P>
            Permettent de comprendre comment les visiteurs utilisent la Plateforme, d'identifier les
            pages les plus consultées, et d'améliorer son ergonomie. Les données sont agrégées et
            anonymisées.
          </P>
          <UL>
            <li>
              <strong>Vercel Analytics</strong>&nbsp;: statistiques de fréquentation respectueuses
              de la vie privée (sans identifiant individuel);
            </li>
            <li>
              <strong>Google Analytics</strong> (si activé)&nbsp;: analyse fine du parcours
              utilisateur avec anonymisation des adresses IP.
            </li>
          </UL>

          <H3>4. Cookies de services tiers</H3>
          <P>Déposés par des services intégrés à la Plateforme.</P>
          <UL>
            <li>
              <strong>Google Maps</strong>&nbsp;: affichage de la carte interactive sur la page des
              biens et les fiches détaillées;
            </li>
            <li>
              <strong>YouTube / Vimeo</strong>&nbsp;: lecture des visites virtuelles intégrées (le
              cas échéant).
            </li>
          </UL>
        </>
      ),
    },
    {
      id: "duree",
      title: t("legal.cookies_s3_title"),
      content: (
        <>
          <P>
            Les cookies sont conservés pour une durée variable selon leur finalité, dans la limite
            de&nbsp;:
          </P>
          <UL>
            <li>
              <strong>Session</strong>&nbsp;: supprimés à la fermeture du navigateur
              (authentification, sécurité);
            </li>
            <li>
              <strong>13 mois maximum</strong> pour les cookies de mesure d'audience;
            </li>
            <li>
              <strong>Stockage local persistant</strong> pour les favoris et préférences — conservé
              jusqu'à action de votre part (effacement des données du navigateur).
            </li>
          </UL>
        </>
      ),
    },
    {
      id: "gestion",
      title: t("legal.cookies_s4_title"),
      content: (
        <>
          <P>Vous pouvez à tout moment configurer votre navigateur pour&nbsp;:</P>
          <UL>
            <li>accepter tous les cookies;</li>
            <li>être averti avant qu'un cookie ne soit déposé;</li>
            <li>refuser tous les cookies;</li>
            <li>supprimer les cookies déjà installés.</li>
          </UL>
          <P>
            Le paramétrage des cookies se fait directement dans les préférences de votre navigateur.
            Voici les liens vers les pages d'aide officielles&nbsp;:
          </P>
          <UL>
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/fr/kb/effacer-cookies-donnees-site-firefox"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/fr-fr/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                Microsoft Edge
              </a>
            </li>
          </UL>
          <P className="text-sm">
            <strong>Attention</strong>&nbsp;: la désactivation de certains cookies (notamment les
            cookies strictement nécessaires) peut empêcher l'utilisation de certaines
            fonctionnalités de la Plateforme — par exemple l'accès à l'espace agent ou la sauvegarde
            de favoris.
          </P>
        </>
      ),
    },
    {
      id: "consentement",
      title: t("legal.cookies_s5_title"),
      content: (
        <>
          <P>
            Conformément aux recommandations de la CNDP, votre consentement n'est pas requis pour
            les cookies strictement nécessaires au fonctionnement de la Plateforme. Pour les cookies
            de mesure d'audience et de services tiers, votre consentement est requis et peut être
            retiré à tout moment via les paramètres de votre navigateur.
          </P>
          <P>
            Lors de votre première visite, un bandeau d'information peut vous être présenté afin de
            recueillir explicitement votre choix.
          </P>
        </>
      ),
    },
    {
      id: "contact",
      title: t("legal.cookies_s6_title"),
      content: (
        <>
          <P>
            Pour toute question relative à cette politique des cookies, vous pouvez nous écrire
            à&nbsp;
            <a
              href="mailto:privacy@wehome.ma"
              className="text-primary font-semibold hover:underline"
            >
              privacy@wehome.ma
            </a>
            .
          </P>
          <P>
            Pour plus d'informations sur la gestion de vos données personnelles, consultez
            notre&nbsp;
            <a href="/confidentialite" className="text-primary font-semibold hover:underline">
              Politique de confidentialité
            </a>
            .
          </P>
        </>
      ),
    },
  ];
}

export default function CookiesPage() {
  const { t, i18n } = useTranslation();
  const sections = useMemo(() => getSections(t), [i18n.language, t]);
  return (
    <LegalPage
      title={t("legal.cookies_title")}
      subtitle={t("legal.cookies_subtitle")}
      lastUpdated="13 mai 2026"
      sections={sections}
    />
  );
}
