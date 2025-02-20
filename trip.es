# trip.es -- take a tour of es
# Invoke as "path-to-new-es < trip.es"

# this trip doesn't tour much of the code at all.  es needs a real
# set of regression tests, soon.

es=$0
echo tripping $es
tmp=/tmp/trip.$pid
rm -f $tmp

fn fail {
	echo >[1=2] test failed: $*
	exit 1
}

fn check {
	if {!~ $#* 3} {
		echo too many args too check on test $1
		exit 1
	}
	if {!~ $2 $3} {
		fail $1
	}
}

fn errorcheck {
	if {!~ $#* 3} {
		fail usage: errorcheck testname expected command
	}
	if {!~ `` '' {$2>[2=1]} *^$3^*} {
		fail error message on $1: $2
	}
}

fn expect {
	echo >[1=2] -n expect $^*^': '
}





#
# es -c
#

if {$es -c >[2]/dev/null} { fail es -c: 'didn''t report a bad exit status' }
x=`{$es -c 'echo $0 $2 $#*' a b c d e f}
if {!~ $x(1) $es}	{ fail es -c: '$0' reported incorrectly as $x(1) }
if {!~ $x(2) b}		{ fail es -c: '$2' reported incorrectly as $x(2) }
if {!~ $x(3) 6}		{ fail es -c: '$#' reported incorrectly as $x(3) }


#
# lexical analysis
#

expect warning	# a nul character is in the text of the trip file here
 

echo here_is_a_really_long_word.It_has_got_to_be_longer_than_1000_characters_for_the_lexical_analyzers_buffer_to_overflow_but_that_should_not_be_too_difficult_to_do.Let_me_start_writing_some_Lewis_Carroll.Twas_brillig_and_the_slithy_toves,Did_gyre_and_gimble_in_the_wabe.All_mimsy_were_the_borogoves,And_the_mome-raths_outgrabe.Beware_the_Jabberwock_my_son,The_jaws_that_bite,the_claws_that_catch.Beware_the_Jub-jub_bird,and_shun_The_frumious_Bandersnatch.He_took_his_vorpal_sword_in_hand,Long_time_the_manxome_foe_he_sought,So_rested_he_by_the_Tumtum_tree,And_stood_awhile_in_thought.And_as_in_uffish_thought_he_stood,The_Jabberwock,with_eyes_of_flame,Came_whiffling_through_the_tulgey_wood,And_burbled_as_it_came.One_two,one_two.And_through_and_through_The_vorpal_blade_went_snicker-snack.He_left_it_dead_and_with_its_head,He_went_galumphing_back.And_hast_thou_slain_the_Jabberwock?Come_to_my_arms,my_beamish_boy,Oh_frabjous_day.Callooh_callay.He_chortled_in_his_joy.Twas_brillig,and_the_slithy_toves,Did_gyre_and_gimble_in_the_wabe,All_mimsy_were_the_borogoves,And_the_mome-raths_outgrabe. > /tmp/$pid.lw

echo 'here_is_a_really_long_word.It_has_got_to_be_longer_than_1000_characters_for_the_lexical_analyzers_buffer_to_overflow_but_that_should_not_be_too_difficult_to_do.Let_me_start_writing_some_Lewis_Carroll.Twas_brillig_and_the_slithy_toves,Did_gyre_and_gimble_in_the_wabe.All_mimsy_were_the_borogoves,And_the_mome-raths_outgrabe.Beware_the_Jabberwock_my_son,The_jaws_that_bite,the_claws_that_catch.Beware_the_Jub-jub_bird,and_shun_The_frumious_Bandersnatch.He_took_his_vorpal_sword_in_hand,Long_time_the_manxome_foe_he_sought,So_rested_he_by_the_Tumtum_tree,And_stood_awhile_in_thought.And_as_in_uffish_thought_he_stood,The_Jabberwock,with_eyes_of_flame,Came_whiffling_through_the_tulgey_wood,And_burbled_as_it_came.One_two,one_two.And_through_and_through_The_vorpal_blade_went_snicker-snack.He_left_it_dead_and_with_its_head,He_went_galumphing_back.And_hast_thou_slain_the_Jabberwock?Come_to_my_arms,my_beamish_boy,Oh_frabjous_day.Callooh_callay.He_chortled_in_his_joy.Twas_brillig,and_the_slithy_toves,Did_gyre_and_gimble_in_the_wabe,All_mimsy_were_the_borogoves,And_the_mome-raths_outgrabe.' > /tmp/$pid.lq

if {!~ ``(){cat /tmp/$pid.lw} ``''{cat /tmp/$pid.lq}} {
	fail expected long string and long word to be identical
}
local(x=`{wc -c /tmp/$pid.lw}) if {!~ $x(1) 1088} {
	fail expected long word to be 1088 bytes
}
if {! local(x=`{wc -c /tmp/$pid.lq}) ~ $x(1) 1088} {
	fail expected long quote to be 1088 bytes
}

rm -f /tmp/$pid.lw /tmp/$pid.lq

let (ifs = '') {
	if {!~ 'h i' `{echo -n h\
i}} {
		fail backslash-newline to space conversion }
	if {!~ $es^\\es `{echo -n $es\\es}} {
		fail backslash after variable name did not terminate variable name scan }
	if {!~ $es^' es' `{echo -n $es\
es}} {
		fail backslash-newline after variable name space conversion }
	if {!~ 'h\i' `{echo -n h\\i}} {
		fail backslash in the middle of word }
	if {!~ 'h \ i' `{echo -n h \\ i}} {
		fail free-standing backslash }
}

if {! $es -c '# eof in comment'} {
	fail eof in comment exited with nonzero status
}

# test the syntax error printer

#local (prompt = '') {
#	if {!~ `` \n {$es -clet>[2=1]} *'1: '*' error near let'} {
#		fail print syntax error
#	}
#	if {!~ `` \n {$es -ic let>[2=1]} *' error'} {
#		fail print syntax error
#	}
#}


# lexical tests

errorcheck 'tokenizer error'	{$es -c 'echo hi |[2'} 'expected ''='' or '']'' after digit'
errorcheck 'tokenizer error'	{$es -c 'echo hi |[92=]'} 'expected digit after ''='''
errorcheck 'tokenizer error'	{$es -c 'echo hi |[a]'} 'expected digit after ''['''
errorcheck 'tokenizer error'	{$es -c 'echo hi |[2-'} 'expected ''='' or '']'' after digit'
errorcheck 'tokenizer error'	{$es -c 'echo hi |[2=99a]'} 'expected '']'' after digit'
errorcheck 'tokenizer error'	{$es -c 'echo hi |[2=a99]'} 'expected digit or '']'' after ''='''
errorcheck 'tokenizer error'	{$es -c 'echo ''hi'} 'eof in quoted string'


#
# blow the input stack
#

if {
	!~ hi `{
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval eval eval \
		eval eval eval eval eval eval eval eval eval eval eval echo hi
	}
} {
	fail huge eval
}

#
# umask
#

umask 0
> $tmp
x=`{ls -l $tmp}
if {!~ $x(1) '-rw-rw-rw-'} { fail umask 0 produced incorrect result: $x(1) }
rm -f $tmp
umask 027
> $tmp
y=`{ls -l $tmp}
if {!~ $y(1) '-rw-r-----'} { fail umask 027 produced incorrect file: $y(1) }
rm -f $tmp
if {!~ `umask 027 0027} { fail umask reported bad value: `umask }

errorcheck 'bad umask'	{umask bad} 'bad umask'
errorcheck 'bad umask'	{umask -027} 'bad umask'
errorcheck 'bad umask'	{umask 999999} 'bad umask'

if {!~ `umask 027 0027} {
	fail bad umask changed umask value to `umask
}

#
# redirections
#

fn bytes { for (i = $*) let(x = `{wc -c $i}) echo $x(1) }
echo foo > foo > bar
if {!~ `{bytes foo} 0} { fail double redirection created non-empty empty file }
if {!~ `{bytes bar} 4} { fail double redirection created wrong sized file: `{bytes bar} }
rm -f foo bar
echo -n >1 >[2]2 >[1=2] foo
x = `` '' {cat 1}
if {!~ $#x 0} { fail dup created non-empty empty file: `` '' {cat 1} }
if {!~ `` '' {cat 2} foo} { fail dup put wrong contents in file : `` '' {cat 2} }
rm -f 1 2

expect error from cat, closing stdin
cat >[0=]

errorcheck 'redirection error' {cat>(1 2 3)} 'too many' 
errorcheck 'redirection error' {cat>()} 'null'

#
# exceptions
#

check catch/retry \
	`` '' {
		let (x = a b c d e f g)
			catch @ e {
				echo caught $e
				if {!~ $#x 0} {
					x = $x(2 ...)
					throw retry
				}
				echo never succeeded
			} {
				echo trying ...
				eval '@'
				echo succeeded -- something''''s wrong
			} 
	} \
'trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
trying ...
caught error $&parse {@}:1: syntax error
never succeeded
'

#
# heredocs and herestrings
#

bigfile=/tmp/big.$pid
od $es | sed 5000q > $bigfile
abc=(this is a)
x=()
result='this is a heredoc
this is an heredoc
'
if {!~ `` '' {<<[5] EOF cat <[0=5]} $result} {fail unquoted heredoc}
$abc heredoc$x
$abc^n $x^here$x^doc
EOF
{if {!~ `` \n cat '	'} {fail quoted heredoc}} << ' '
	
 

<<<[9] ``''{cat $bigfile} \
{
 	if{!~ ``''{cat <[0=9]}``'' cat}{fail large herestrings}
} < \
$bigfile

rm -f $bigfile

if {!~ `{cat<<eof
$$
eof
} '$'} {
	fail quoting '$' in heredoc
}

errorcheck 'incomplete heredoc'	{$es -c 'cat<<eof'} 'pending' 
errorcheck 'incomplete heredoc'	{$es -c 'cat<<eof'\n} 'incomplete'

errorcheck 'bad heredoc marker'	{$es -c 'cat<<(eof eof)'} 'not a single literal word'
errorcheck 'bad heredoc marker'	{$es -c 'cat<<'''\n''''\n} 'contains a newline'

#
# Flat command expansion
#

x=`^{echo some random phrase that should be identified as a single string}
if {! ~ $#x 1} { fail flat command expansion failed: non-flat output }

x=`^{echo simple test with concatenation}^' '^`^{echo another random phrase}
if {! ~ $#x 1} { fail flat command expansion failed: non-flat output }

x=``^ abc {echo -n abchello}
if {! ~ $x 'hello'} { fail flat command expansion failed: unexpected output }


errorcheck 'syntax error' {$es -c '``^{true}'} 'syntax error'
errorcheck 'syntax error' {$es -c '`^^{true}'} 'syntax error'

#
# Equal sign in command arguments
#

errorcheck '''='' in argument does not cause error' {$es -c 'echo foo=bar'} ''
check '''='' is automatically concatenated with adjacent strings' `^{echo foo=bar} 'foo=bar'
errorcheck '''='' as standalone argument does not cause error' {$es -c 'echo foo = bar'} ''
check '''='' is not automatically concatenated with non-adjacent strings' `^{echo foo = bar} 'foo = bar'
check 'assignment preferred over concatenation' `^{foo^= = 384; echo $foo} '= 384'
check 'first command arg with leading ''='' results in assignment' `^{echo =foo; echo $echo} 'foo'

#
# Match command
#

# This section makes it painfully clear that
# a better way to test is absolutely necessary.
for (subjstr = ( '()' 'foo' )) {
	subj = <={eval result $subjstr}
	for (
		exp = (
			<={}
			<={if {~ $subj}{result CMD}}
			<={if {~ $subj}{result CMD1}{result CMD2}}
			<={if {~ $subj *}{result CMD1}{result CMD2}}
		)
		rc = (
			<={match $subj ()}
			<={match $subj (() {result CMD})}
			<={match $subj (
				() {result CMD1}; * {result CMD2}
			)}
			<={match $subj ( * {result CMD1}
				* {result CMD2};)}
		)
	) {
		check 'match1 '^$subjstr^' -- '^$rc^' failed to match '^$exp $exp $rc
	}
}

subjects = (
	# ??zz -- wildcards can be used in patterns to match subjects
	'(fizz buzz)'
	# [1-9] -- cases are evaluated in order of appearance,
	#          and [1-9] comes before ??zz
	'(buzz 4 fizz 2 1)'
	# a* c* -- 'case patt1 patt2' matches like '~ $subj patt1 patt2'
	'(he ate it all)'
	'(bravo charlie)'
	# list.o -- wildcards are expanded in subjects
	'l*.o'
	# *.o -- wildcards are not expanded in patterns
	'nonexistent.o'
	# * -- catch-all for subjects that did not match any preceding patterns
	#
	# 'case *' should be last in every switch, but ensuring that would make
	# parsing more complicated and adding a 'default' keyword would just be
	# one more keyword to break existing scripts.
	'(20 fizzy ''think up different'' match.c)'
)
if-block = '
if {~ $subj list.o} {
	result list
} {~ $subj *.o} {
	result object
} {~ $subj [1-9]} {
	result digit
} {~ $subj ??zz} {
	result fizz/buzz
} {~ $subj a* c*} {
	result AC_OUTPUT
} {
	result other
}'
match-block = 'match $subj (
	list.o     {result list}
	*.o        {result object}
	[1-9]      {result digit}
	??zz       {result fizz/buzz}
	(a* c*)    {result AC_OUTPUT}
	*          {result other}
)'
for (subjstr = $subjects) {
	subj = <={eval result $subjstr}
	exp = <={eval $if-block}
	rc = <={eval $match-block}
	check 'match2 '^$subjstr^' -- '^$rc^' failed to match '^$exp $exp $rc
}

# The following ensures that the body of a case does not require
# braces and that 'match' has no special handling for 'break'.
errorcheck 'uncaught exception' {$es -c 'match () (* break)'} 'uncaught exception'
