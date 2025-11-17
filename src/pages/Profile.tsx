import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, MessageSquare, ThumbsUp, Award, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Separator } from "@/components/ui/separator";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReputationBadge } from "@/components/ReputationBadge";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { QuestionsTab } from "@/components/profile/QuestionsTab";
import { AnswersTab } from "@/components/profile/AnswersTab";

const Profile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    questions: 0,
    answers: 0,
    helpfulVotes: 0,
    acceptedAnswers: 0,
    wellRatedQuestions: 0,
  });
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authUser) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para ver seu perfil",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    fetchProfile();
    fetchStats();
    fetchBadges();

    // Subscribe to realtime updates
    const questionsSubscription = supabase
      .channel('profile-questions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `user_id=eq.${authUser.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    const answersSubscription = supabase
      .channel('profile-answers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `user_id=eq.${authUser.id}`
        },
        () => {
          fetchStats();
          checkAndAwardBadges();
        }
      )
      .subscribe();

    const votesSubscription = supabase
      .channel('profile-votes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes'
        },
        () => {
          fetchStats();
          checkAndAwardBadges();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsSubscription);
      supabase.removeChannel(answersSubscription);
      supabase.removeChannel(votesSubscription);
    };
  }, [authUser, navigate]);

  const fetchProfile = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!authUser) return;

    // Count questions
    const { count: questionsCount } = await supabase
      .from("questions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", authUser.id);

    // Count answers
    const { count: answersCount } = await supabase
      .from("answers")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", authUser.id);

    // Count helpful votes on user's answers
    const { data: userAnswers } = await supabase
      .from("answers")
      .select("id")
      .eq("user_id", authUser.id);

    let helpfulVotesCount = 0;
    if (userAnswers && userAnswers.length > 0) {
      const answerIds = userAnswers.map(a => a.id);
      const { count: votesCount } = await supabase
        .from("votes")
        .select("*", { count: 'exact', head: true })
        .in("answer_id", answerIds)
        .eq("vote_type", 1);
      helpfulVotesCount = votesCount || 0;
    }

    // Count accepted answers
    const { count: acceptedCount } = await supabase
      .from("answers")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", authUser.id)
      .eq("is_accepted", true);

    // Count well-rated questions (>5 votes)
    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .eq("user_id", authUser.id);

    let wellRatedCount = 0;
    if (questions && questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      for (const qId of questionIds) {
        const { count } = await supabase
          .from("votes")
          .select("*", { count: 'exact', head: true })
          .eq("question_id", qId)
          .eq("vote_type", 1);
        if (count && count > 5) {
          wellRatedCount++;
        }
      }
    }

    setStats({
      questions: questionsCount || 0,
      answers: answersCount || 0,
      helpfulVotes: helpfulVotesCount,
      acceptedAnswers: acceptedCount || 0,
      wellRatedQuestions: wellRatedCount,
    });
  };

  const fetchBadges = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        *,
        badges (*)
      `)
      .eq("user_id", authUser.id)
      .order("earned_at", { ascending: false });

    if (!error && data) {
      setBadges(data);
    }
  };

  const checkAndAwardBadges = async () => {
    if (!authUser) return;

    const { data: allBadges } = await supabase
      .from("badges")
      .select("*");

    const { data: earnedBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", authUser.id);

    const earnedBadgeIds = earnedBadges?.map(b => b.badge_id) || [];

    if (!allBadges) return;

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      switch (badge.requirement_type) {
        case "questions":
          shouldAward = stats.questions >= badge.requirement_count;
          break;
        case "answers":
          shouldAward = stats.answers >= badge.requirement_count;
          break;
        case "helpful_votes":
          shouldAward = stats.helpfulVotes >= badge.requirement_count;
          break;
        case "accepted_answers":
          shouldAward = stats.acceptedAnswers >= badge.requirement_count;
          break;
      }

      if (shouldAward) {
        const { error } = await supabase
          .from("user_badges")
          .insert({
            user_id: authUser.id,
            badge_id: badge.id,
          });

        if (!error) {
          toast({
            title: "Nova conquista! 🎉",
            description: `Você ganhou a medalha "${badge.name}"`,
          });
          fetchBadges();
        }
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      MessageSquare,
      Award,
      ThumbsUp,
      CheckCircle,
      Trophy,
    };
    return icons[iconName] || MessageSquare;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <ProfileSkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                        <EditProfileDialog profile={profile} onProfileUpdated={fetchProfile} />
                      </div>
                      <p className="text-muted-foreground mb-3">@{profile?.username}</p>
                      {profile?.headline && (
                        <p className="text-sm text-foreground mb-3 italic">"{profile.headline}"</p>
                      )}
                      <ReputationBadge
                        acceptedAnswers={stats.acceptedAnswers}
                        helpfulVotes={stats.helpfulVotes}
                        wellRatedQuestions={stats.wellRatedQuestions}
                      />
                    </div>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground mt-4">{profile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile?.university && (
                      <Badge variant="secondary">{profile.university}</Badge>
                    )}
                    {profile?.course && (
                      <Badge variant="outline">{profile.course}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="questions">Perguntas ({stats.questions})</TabsTrigger>
              <TabsTrigger value="answers">Respostas ({stats.answers})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Stats Cards */}
              <ProfileStats
                questions={stats.questions}
                answers={stats.answers}
                onQuestionsClick={() => setActiveTab("questions")}
                onAnswersClick={() => setActiveTab("answers")}
              />

              {/* Badges Section */}
              {badges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-gold" />
                      Conquistas Desbloqueadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {badges.map((userBadge) => {
                        const IconComponent = getIconComponent(userBadge.badges.icon);
                        return (
                          <div
                            key={userBadge.id}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm text-center">
                              {userBadge.badges.name}
                            </h3>
                            <p className="text-xs text-muted-foreground text-center">
                              {userBadge.badges.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(userBadge.earned_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              {authUser && <QuestionsTab userId={authUser.id} />}
            </TabsContent>

            <TabsContent value="answers" className="mt-6">
              {authUser && <AnswersTab userId={authUser.id} />}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
